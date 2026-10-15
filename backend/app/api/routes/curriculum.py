import io
import os
import re
import uuid
import base64
import zipfile
import xml.etree.ElementTree as ET
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter()

class DocxUploadRequest(BaseModel):
    fileName: str
    contentBase64: str
    courseId: Optional[str] = "course-grade8-py"

@router.post("/curriculum/upload-docx")
async def upload_and_parse_docx(payload: DocxUploadRequest):
    try:
        raw_bytes = base64.b64decode(payload.contentBase64, validate=True)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 payload: {str(e)}")

    if not zipfile.is_zipfile(io.BytesIO(raw_bytes)):
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid docx document.")

    try:
        z = io.BytesIO(raw_bytes)
        with zipfile.ZipFile(z, 'r') as archive:
            # 1. Map relationships to find media files
            image_map = {}
            try:
                rels_xml = archive.read('word/_rels/document.xml.rels').decode('utf-8', errors='ignore')
                rels_tree = ET.fromstring(rels_xml)
                for rel in rels_tree:
                    r_id = rel.attrib.get('Id')
                    target = rel.attrib.get('Target')
                    if target and target.startswith('media/'):
                        image_map[r_id] = target
            except Exception as e:
                print("Rels read error:", e)

            # 2. Extract media images as base64 data URLs
            image_urls = {}
            for r_id, target in image_map.items():
                try:
                    img_data = archive.read('word/' + target)
                    ext = target.split('.')[-1].lower()
                    mime = f"image/{ext}" if ext in ['png', 'jpg', 'jpeg', 'gif', 'svg'] else "image/png"
                    b64 = base64.b64encode(img_data).decode('utf-8')
                    image_urls[r_id] = f"data:{mime};base64,{b64}"
                except Exception as e:
                    print("Image extract error:", e)

            # 3. Read document.xml
            doc_xml = archive.read('word/document.xml')
            tree = ET.fromstring(doc_xml)

            # 4. Extract paragraphs and drawings
            paragraphs_data = []
            for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                texts = [node.text for node in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
                full_text = ''.join(texts).strip()

                embedded_img = None
                blips = p.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
                for b in blips:
                    embed_id = b.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
                    if embed_id in image_urls:
                        embedded_img = image_urls[embed_id]
                        break

                if full_text or embedded_img:
                    paragraphs_data.append({
                        'text': full_text,
                        'image': embedded_img
                    })

        # 5. Structure paragraphs into Chapter, Lessons, and Pages
        chapter_id = f"ch-{uuid.uuid4().hex[:6]}"
        chapter_title = "Uploaded Chapter"
        if paragraphs_data:
            # Check first few paragraphs for chapter title
            for p in paragraphs_data[:3]:
                if "CHAPTER" in p['text'].upper():
                    chapter_title = p['text'].strip()
                    break
            if chapter_title == "Uploaded Chapter" and paragraphs_data:
                chapter_title = paragraphs_data[0]['text'][:60] or "Uploaded Chapter"

        # Group by major headings
        lessons = []
        current_lesson = None
        current_page_lines = []
        current_page_img = None
        current_page_title = "Introduction"
        lesson_order = 1
        page_num = 1

        def commit_page():
            nonlocal current_page_lines, current_page_img, current_page_title, page_num
            if not current_page_lines and not current_page_img:
                return
            if current_lesson is not None:
                content_text = "\n\n".join(current_page_lines)
                is_activity = "ACTIVITY" in current_lesson['title'].upper()
                current_lesson['pages'].append({
                    'pageNumber': page_num,
                    'title': current_page_title,
                    'content': content_text,
                    'imageUrl': current_page_img,
                    'hasCodingPrompt': is_activity and page_num == 2,
                })
                page_num += 1
            current_page_lines = []
            current_page_img = None

        def start_new_lesson(title: str, summary: str = ""):
            nonlocal current_lesson, lesson_order, page_num
            commit_page()
            is_activity = "ACTIVITY" in title.upper()
            activity_config = None
            if is_activity:
                activity_config = {
                    'enabled': True,
                    'mode': 'text',
                    'language': 'python',
                    'title': title,
                    'instructions': f"Complete the hands-on coding activity for {title}.",
                    'projectTemplateId': f"starter-upload-{uuid.uuid4().hex[:6]}",
                    'starterFiles': [
                        {
                            'name': 'main.py',
                            'language': 'python',
                            'content': f"# {title}\n# Write and test your solution here!\n\nprint('Running {title}...')\n"
                        }
                    ]
                }

            current_lesson = {
                'id': f"lesson-upload-{uuid.uuid4().hex[:6]}",
                'chapterId': chapter_id,
                'courseId': payload.courseId,
                'order': lesson_order,
                'title': title,
                'summary': summary or f"Learn concepts and practice {title}.",
                'estimatedMinutes': 20,
                'pages': [],
                'codingActivity': activity_config
            }
            lessons.append(current_lesson)
            lesson_order += 1
            page_num = 1

        # Start default first lesson
        start_new_lesson("1. Introduction & Overview", "Overview of the chapter and key concepts.")

        for item in paragraphs_data:
            text = item['text']
            img = item['image']

            if img and not current_page_img:
                current_page_img = img

            # Check if this line is a new major lesson heading
            is_heading = bool(re.match(r'^(?:[0-9]+\.\s+|Section\s+[0-9]+|Activity\s+[0-9]+|Key Vocabulary|Chapter Summary|Final Reflection)', text, re.IGNORECASE))
            if is_heading:
                commit_page()
                start_new_lesson(text[:60], text[:120])
                current_page_title = text
                continue

            if len(text) > 0:
                current_page_lines.append(text)

            # If page is getting long (e.g. > 6 paragraphs), create another page in this lesson
            if len(current_page_lines) >= 7:
                commit_page()
                current_page_title = f"{current_lesson['title']} (Continued)"

        commit_page()

        # Clean up empty lessons
        clean_lessons = [l for l in lessons if len(l['pages']) > 0]

        return {
            "status": "success",
            "chapter": {
                "id": chapter_id,
                "courseId": payload.courseId,
                "order": 99,
                "title": chapter_title,
                "description": f"Uploaded chapter containing {len(clean_lessons)} interactive lessons.",
                "lessons": clean_lessons
            }
        }
    except HTTPException:
        raise
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing expected document structure: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse docx: {str(e)}")
