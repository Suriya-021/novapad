import { Course, ChapterSection, CodingActivityConfig } from '../types/curriculum';

// ============================================================================
// CODING LAB ACTIVITY CONFIGURATIONS
// ============================================================================

export const ACTIVITY_1_CALC_CONFIG: CodingActivityConfig = {
  enabled: true,
  mode: 'text',
  language: 'python',
  title: 'Activity 1: Simple Calculator Lab',
  instructions: `### Lab Objectives:
1. Prompt the user for two numbers using \`float(input(...))\`.
2. Store each response in a meaningful variable (\`first_number\`, \`second_number\`).
3. Compute and display:
   - **Addition** (\`+\`)
   - **Subtraction** (\`-\`)
   - **Multiplication** (\`*\`)
   - **Division** (\`/\`)
4. Verify that you guard against dividing by zero!
5. ⚡ **Level-Up Challenge**: Calculate and display the average of the two numbers.`,
  projectTemplateId: 'g8-activity-1-calc',
  difficulty: 'beginner',
  starterFiles: [
    {
      name: 'main.py',
      language: 'python',
      content: `# Activity 1: Simple Calculator
# Follow the walkthrough on the left book page!

# 1. Ask the user for two numbers (convert with float())
first_number = float(input("Enter the first number: "))
second_number = float(input("Enter the second number: "))

# 2. Calculate and display the four arithmetic results
print("\\n--- CALCULATOR RESULTS ---")
print("Addition:      ", first_number + second_number)
print("Subtraction:   ", first_number - second_number)
print("Multiplication:", first_number * second_number)

# Guard against dividing by zero!
if second_number != 0:
    print("Division:      ", first_number / second_number)
else:
    print("Division:       Cannot divide by zero!")

# ⚡ LEVEL-UP CHALLENGE:
# Calculate and print the average of the two numbers below:
# average = (first_number + second_number) / 2
# print("Average:       ", average)
`,
    },
  ],
  hints: [
    'Use float() so that the calculator works with decimals as well as whole numbers.',
    'Remember that dividing by zero causes a ZeroDivisionError in Python.',
    'Click "Run" at the top right of the IDE to execute your calculator in the Terminal.',
  ],
};

export const ACTIVITY_2_AGE_CONFIG: CodingActivityConfig = {
  enabled: true,
  mode: 'text',
  language: 'python',
  title: 'Activity 2: Age Converter Lab',
  instructions: `### Lab Objectives:
1. Prompt the user for their age in years using \`int(input(...))\`.
2. Compute:
   - Approximate months (\`age_years * 12\`)
   - Approximate weeks (\`age_years * 52\`)
   - Approximate days (\`age_years * 365\`)
3. Print a formatted age conversion report.
4. ⚡ **Challenge**: Customize the prompts and labels to make it feel like a real health app!`,
  projectTemplateId: 'g8-activity-2-age',
  difficulty: 'beginner',
  starterFiles: [
    {
      name: 'main.py',
      language: 'python',
      content: `# Activity 2: Age Converter
# Converts age in whole years into approximate months, weeks, and days.

# 1. Ask the user for age in whole years
age_years = int(input("Enter your age in years: "))

# 2. Compute approximate time units
approximate_months = age_years * 12
approximate_weeks = age_years * 52
approximate_days = age_years * 365

# 3. Display labelled results
print("\\n--- AGE CONVERSION REPORT ---")
print("Approximate months:", approximate_months)
print("Approximate weeks: ", approximate_weeks)
print("Approximate days:  ", approximate_days)

# ⚡ CHALLENGE: Add a message showing approximate hours lived!
# approximate_hours = approximate_days * 24
# print("Approximate hours: ", approximate_hours)
`,
    },
  ],
  hints: [
    'Remember to use int() because age is typically given as a whole number.',
    'Multiplication lets one input value produce multiple related metrics.',
  ],
};

export const ACTIVITY_3_PROFILE_CONFIG: CodingActivityConfig = {
  enabled: true,
  mode: 'text',
  language: 'python',
  title: 'Activity 3: Student Profile System Lab',
  instructions: `### Lab Objectives:
1. Prompt for multiple pieces of personal info:
   - Name (\`str\`)
   - Age (\`int\`)
   - Grade (\`str\`)
   - Favourite Subject (\`str\`)
   - Future career or interest (\`str\`)
2. Display a polished, formatted profile summary.
3. ⭐ **Creative Challenge**: Add a prompt for your hobby or favorite game and display it neatly!`,
  projectTemplateId: 'g8-activity-3-profile',
  difficulty: 'beginner',
  starterFiles: [
    {
      name: 'main.py',
      language: 'python',
      content: `# Activity 3: Student Profile System
# Collects information and displays a structured student profile.

# 1. Collect information
student_name = input("Name: ")
student_age = int(input("Age: "))
student_grade = input("Grade: ")
favourite_subject = input("Favourite subject: ")
future_interest = input("Future career or interest: ")

# 2. Display formatted student profile
print("\\n===============================")
print("       STUDENT PROFILE         ")
print("===============================")
print("Name:             ", student_name)
print("Age:              ", student_age)
print("Grade:            ", student_grade)
print("Favourite subject:", favourite_subject)
print("Future interest:  ", future_interest)
print("===============================")

# ⭐ CREATIVE CHALLENGE:
# Add a prompt for favorite_hobby or daily_study_hours and display it in the card!
`,
    },
  ],
  hints: [
    'Notice that student_age uses int() for numerical validation, while student_name and grade stay as strings.',
    'Use separator lines like === to make console reports easy to read.',
  ],
};

export const ACTIVITY_4_UNIT_CONFIG: CodingActivityConfig = {
  enabled: true,
  mode: 'text',
  language: 'python',
  title: 'Activity 4: Unit Converter Lab',
  instructions: `### Lab Objectives:
1. Create a unit converter for:
   - **Option A**: Kilometres to Metres (\`km * 1000\`)
   - **Option B**: Celsius to Fahrenheit (\`(celsius * 9 / 5) + 32\`)
   - **Option C**: Hours to Minutes (\`hours * 60\`)
2. Use \`float(input(...))\` to accept decimal measurements.
3. ⚡ **Challenge**: Add a menu that lets the user choose which conversion they want to perform!`,
  projectTemplateId: 'g8-activity-4-unit',
  difficulty: 'beginner',
  starterFiles: [
    {
      name: 'main.py',
      language: 'python',
      content: `# Activity 4: Unit Converter
# Choose a conversion option or test all three!

print("Choose a conversion:")
print("1. Kilometres to Metres")
print("2. Celsius to Fahrenheit")
print("3. Hours to Minutes")

choice = input("Enter choice (1, 2, or 3): ")

if choice == "1":
    kilometres = float(input("Enter kilometres: "))
    metres = kilometres * 1000
    print(f"{kilometres} km = {metres} metres")

elif choice == "2":
    celsius = float(input("Enter temperature in Celsius: "))
    fahrenheit = (celsius * 9 / 5) + 32
    print(f"{celsius}°C = {fahrenheit}°F")

elif choice == "3":
    hours = float(input("Enter hours: "))
    minutes = hours * 60
    print(f"{hours} hours = {minutes} minutes")

else:
    print("Invalid choice! Please run again and enter 1, 2, or 3.")
`,
    },
  ],
  hints: [
    'Formula for Celsius to Fahrenheit: (celsius * 9 / 5) + 32',
    'Always test with both integer numbers (e.g. 5) and decimal numbers (e.g. 2.5).',
  ],
};

// ============================================================================
// CHAPTER 1 SECTIONS DEFINITION (FOR DROPDOWN & TOC NAVIGATION)
// ============================================================================

export const CHAPTER_1_SECTIONS: ChapterSection[] = [
  {
    id: 'sec-01',
    sectionNumber: 1,
    title: 'Introduction & What is Programming?',
    startPage: 1,
    endPage: 3,
    summary: 'Explore how mobile apps run on code, translate human ideas into precise instructions, and predict sequential execution.',
  },
  {
    id: 'sec-02',
    sectionNumber: 2,
    title: 'Setting Up Python, VS Code & First Programs',
    startPage: 4,
    endPage: 5,
    summary: 'Set up your developer environment, project folders, write print() statements, and follow Python text quotation rules.',
  },
  {
    id: 'sec-03',
    sectionNumber: 3,
    title: 'Variables: Storing Information',
    startPage: 6,
    endPage: 7,
    summary: 'Learn the container analogy of memory, the assignment operator (=), variable mutability, and snake_case naming.',
  },
  {
    id: 'sec-04',
    sectionNumber: 4,
    title: 'Understanding Data Types',
    startPage: 8,
    endPage: 9,
    summary: 'Master Strings, Integers, Floats, and Booleans. Understand dynamic typing, division behavior, and classification.',
  },
  {
    id: 'sec-05',
    sectionNumber: 5,
    title: 'User Input and Output',
    startPage: 10,
    endPage: 11,
    summary: 'Collect interactive user input with input(), string returns, type casting with int() and float(), and descriptive prompts.',
  },
  {
    id: 'sec-06',
    sectionNumber: 6,
    title: 'Comments, Clean Code & Debugging',
    startPage: 12,
    endPage: 13,
    summary: 'Write readable code with Python comments and clean structure. Master the 5-step debugging process and fix syntax vs logic errors.',
  },
  {
    id: 'sec-07',
    sectionNumber: 7,
    title: 'Computational Thinking & Planning',
    startPage: 14,
    endPage: 15,
    summary: 'Understand problem decomposition, identify required information, and create clear algorithmic pseudocode before coding.',
  },
  {
    id: 'sec-08',
    sectionNumber: 8,
    title: 'Activity 1: Simple Calculator Lab',
    startPage: 16,
    endPage: 17,
    isCodingLab: true,
    codingActivity: ACTIVITY_1_CALC_CONFIG,
    summary: 'Build an interactive arithmetic calculator prompting for numbers and computing addition, subtraction, multiplication, and division.',
  },
  {
    id: 'sec-09',
    sectionNumber: 9,
    title: 'Activity 2: Age Converter Lab',
    startPage: 18,
    endPage: 19,
    isCodingLab: true,
    codingActivity: ACTIVITY_2_AGE_CONFIG,
    summary: 'Convert age in years into approximate months, weeks, and days using mathematical multipliers and computational estimates.',
  },
  {
    id: 'sec-10',
    sectionNumber: 10,
    title: 'Activity 3: Student Profile System Lab',
    startPage: 20,
    endPage: 21,
    isCodingLab: true,
    codingActivity: ACTIVITY_3_PROFILE_CONFIG,
    summary: 'Build a multi-field personal profile program demonstrating decomposition, variable storage, and formatted reporting.',
  },
  {
    id: 'sec-11',
    sectionNumber: 11,
    title: 'Activity 4: Unit Converter Lab',
    startPage: 22,
    endPage: 23,
    isCodingLab: true,
    codingActivity: ACTIVITY_4_UNIT_CONFIG,
    summary: 'Create scientific unit conversion tools: kilometres to metres, Celsius to Fahrenheit, and hours to minutes.',
  },
  {
    id: 'sec-12',
    sectionNumber: 12,
    title: 'Chapter Review, Vocabulary & Next Steps',
    startPage: 24,
    endPage: 26,
    summary: 'Review 18 core vocabulary terms, reflect on key takeaways, and preview Chapter 2: Operators and Conditions.',
  },
];

// Helper to look up current section from 0-based pageIndex
export function getSectionForPageIndex(pageIndex: number): ChapterSection {
  const pageNum = pageIndex + 1;
  return CHAPTER_1_SECTIONS.find((s) => pageNum >= s.startPage && pageNum <= s.endPage) || CHAPTER_1_SECTIONS[0];
}

// ============================================================================
// CONTINUOUS 26-PAGE CHAPTER 1 CURRICULUM
// ============================================================================

export const SAMPLE_COURSES: Course[] = [
  {
    id: 'course-grade8-py',
    title: 'Python Programming Foundations',
    gradeLevel: 'Grade 8',
    subject: 'Computer Science & Python',
    badge: 'Grade 8 Python',
    description: 'Master Python fundamentals, computational thinking, and real-world interactive coding through our interactive Flipbook and side-by-side IDE.',
    chapters: [
      {
        id: 'ch-g8-01',
        courseId: 'course-grade8-py',
        order: 1,
        title: 'Chapter 1: Python Fundamentals & Computational Thinking',
        description: 'Learn how computers execute code, variables, data types, input/output, debugging, and computational thinking with 4 hands-on projects.',
        lessons: [
          {
            id: 'lesson-g8-ch01-full',
            chapterId: 'ch-g8-01',
            courseId: 'course-grade8-py',
            order: 1,
            title: 'Chapter 1: Python Fundamentals & Computational Thinking',
            summary: 'Complete textbook chapter containing 26 continuous pages across 12 sections with 4 hands-on coding labs.',
            estimatedMinutes: 90,
            sections: CHAPTER_1_SECTIONS,
            codingActivity: ACTIVITY_1_CALC_CONFIG,
            pages: [
              // ==============================================================
              // SECTION 1: Introduction & What is Programming? (Pages 1 - 3)
              // ==============================================================
              {
                pageNumber: 1,
                sectionIndex: 0,
                sectionTitle: '1. Introduction & What is Programming?',
                title: 'How Does a Mobile App Know What to Display?',
                content: `When you open a mobile app, it may show a welcome screen, load your profile, respond to a tap, or display new information. The app does not guess what to do. Programmers have designed instructions that tell the computer what to do in many different situations.

In this chapter, you will begin writing those instructions in Python. You will also learn the thinking behind useful programs: understand the problem, break it into parts, plan, code, test, debug, and improve.

⭐ IMAGINE THIS...You are designing a digital study planner for your grade. Before writing code, you must decide what information the planner needs, what it should display, and how you will know that it works. That planning is programming too.

### What You Will Learn in This Chapter:
- **What programming is** and how computers execute code.
- How to install Python, open VS Code, create a \`.py\` file, and run it.
- How to use \`print()\`, comments, variables, input, and output.
- How strings, integers, floats, and booleans represent different information.
- How meaningful names and clean organisation make code easier to read.
- How to read beginner errors and debug step by step.
- How computational thinking helps you plan a solution before coding.

### Chapter Road Map
We will move from instructions to interactive programs. First you will display messages, then store and collect information, and finally combine those skills in a personal information management system.`,
              },
              {
                pageNumber: 2,
                sectionIndex: 0,
                sectionTitle: '1. Introduction & What is Programming?',
                title: '1. What Is Programming?',
                content: `Programming is giving clear, step-by-step instructions to a computer to solve a problem or build something useful. A program is simply a recipe of instructions written in a language like Python that the computer can follow exactly.

People often understand incomplete instructions because we use context and common sense. Computers need the missing details. If an instruction says “prepare the report,” a computer needs to know which information to use, what order to follow, and what result to produce.

### Human Idea vs. Programming Question

| Human Idea | Programming Question |
|---|---|
| “Show the student profile.” | Which information should be collected? |
| “Make it clear.” | What should appear, and in what order? |
| “Check the answer.” | What result counts as correct? |

Notice how real-world applications translate everyday human needs into automated software instructions:

🔗 REAL-WORLD CONNECTIONA banking app, a game, and a school timetable all depend on instructions. Their interfaces look different, but each system is built from smaller steps that programmers can test.

### Think About It
Rewrite this vague instruction so that a computer could follow it:
> **“Organise my homework.”**
Include at least three precise actions with clear order.`,
              },
              {
                pageNumber: 3,
                sectionIndex: 0,
                sectionTitle: '1. Introduction & What is Programming?',
                title: '2. How Computers Execute Code',
                imageUrl: '/images/chapter1/image1.png',
                imageCaption: 'How Computers Execute Code: Python Code -> Interpreter -> Hardware -> Screen Output',
                content: `You write code in a Python file. Python interprets the code, checking its structure and working out what each instruction means. The computer then carries out the instructions and produces output, such as text on the screen. Simple programs usually execute from top to bottom.

\`\`\`python
print("First instruction")
print("Second instruction")
print("Third instruction")
\`\`\`

The output appears in the exact same order as the instructions:
1. \`First instruction\`
2. \`Second instruction\`
3. \`Third instruction\`

Program tracing means following each line and predicting what it will do before you run it.

🧠 PREDICT THE OUTPUTRead the three-line program above. Write the exact output in your notebook, run it, and compare. If your prediction differs, identify the line that changed your expectation.

✅ GOOD PROGRAMMING HABITUse this cycle throughout the course: **Predict → Run → Observe → Explain**. A result is much more useful when you can explain why it happened!`,
                codeSnippet: {
                  language: 'python',
                  code: 'print("First instruction")\nprint("Second instruction")\nprint("Third instruction")',
                  explanation: 'Python executes statements sequentially from top to bottom.',
                },
              },

              // ==============================================================
              // SECTION 2: Setting Up Python, VS Code & First Programs (Pages 4 - 5)
              // ==============================================================
              {
                pageNumber: 4,
                sectionIndex: 1,
                sectionTitle: '2. Setting Up Python, VS Code & First Programs',
                title: '3. Setting Up Python and VS Code',
                content: `Python is the programming language used in this course. VS Code is a code editor: a workspace where you can create files, write code, and run programs. Your teacher or school administrator may manage installation permissions on school devices.

### Using a School Computer?
If Python and VS Code are already installed on your school machine:
1. Open the Python or VS Code environment provided by your school.
2. Ask your teacher which program, folder, or shortcut you should use.
3. Skip ahead to Section 4 to write your very first program!

### Setting Up at Home:
1. **Install Python**: Download from the official Python website. On Windows, make sure to check **"Add Python to PATH"**!
2. **Install and Open VS Code**: Install the Microsoft Python extension.
3. **Create a Folder**: Name it \`Grade8_Python\` to keep your chapter programs organized together.
4. **Create a File**: Create \`first_program.py\`. The \`.py\` extension tells the computer this is Python source code.

💡 DID YOU KNOW?A project folder is more than a storage location. Keeping related files together makes your work easier to find, test, share, and improve.

🛠 IF SOMETHING GOES WRONGEncountering a setup hiccup is completely normal — it happens to professional developers all the time! Here are two common issues:
• Problem 1: 'python' vs 'py' — Some Windows computers respond to py instead of python. If typing python --version gives an error, try typing py --version instead.
• Problem 2: What is PATH? — When you type a command in the terminal, Windows searches specific folders to find where Python is located. If Python was installed without checking 'Add python.exe to PATH', Windows simply does not know where Python lives. Re-run the installer and check the box!
Still stuck? Ask your teacher. Asking for help is what good programmers do!`,
              },
              {
                pageNumber: 5,
                sectionIndex: 1,
                sectionTitle: '2. Setting Up Python, VS Code & First Programs',
                title: '4. Your First Python Programs',
                content: `The \`print()\` function displays output on the screen. The parentheses hold the information that print should display. Text is written inside quotation marks so Python can recognise where the text begins and ends.

\`\`\`python
print("Hello, Grade 8!")
\`\`\`

The output is:
\`Hello, Grade 8!\`

The quotation marks are part of the code, but they are not displayed as part of the output text.

### Building Up the Example
\`\`\`python
print("Python is a tool for ideas.")
print("Clear plans lead to better programs.")
print("I will test my code.")
\`\`\`

- Change one message and predict the output.
- Add a fourth \`print()\` instruction.
- Move one instruction and predict how the order changes.
- Run the program and explain what you observed.

💻 TRY IT YOURSELFCreate a three-line “programmer introduction” that displays your name or role, a technology problem you care about, and one skill you want to learn. Use Predict → Change → Run → Observe → Explain.

### Text Must Be Marked Clearly
\`\`\`python
print("Correct text")    # Valid: enclosed in quotes
print(Correct text)      # Syntax Error: Python thinks this is a variable name!
\`\`\`

The first instruction displays text. The second is not valid because the words are not inside quotation marks. Python needs quotation marks to know that words are text rather than code names.

🧠 THINK LIKE A PROGRAMMERWhy is “the program should display a welcome message” not the same as a complete Python instruction? Name the details a programmer must choose (exact text, punctuation, function name).`,
                codeSnippet: {
                  language: 'python',
                  code: 'print("Python is a tool for ideas.")\nprint("Clear plans lead to better programs.")\nprint("I will test my code.")',
                  explanation: 'Each print statement automatically starts a new line on the screen.',
                },
              },

              // ==============================================================
              // SECTION 3: Variables: Storing Information (Pages 6 - 7)
              // ==============================================================
              {
                pageNumber: 6,
                sectionIndex: 2,
                sectionTitle: '3. Variables: Storing Information',
                title: '5. Variables: Storing Information',
                imageUrl: '/images/chapter1/image2.png',
                imageCaption: 'Variables: Named containers in computer memory holding values',
                content: `A variable is a named place where a program stores information. A useful analogy is a **labelled container**: the label helps you find the value later, and the value is the information inside it. Variables let a program remember information instead of repeating it everywhere.

\`\`\`python
student_name = "Alex"
student_age = 13
\`\`\`

The name on the left is the **variable name**. The equals sign (\`=\`) stores the value on the right inside that name. In programming, \`=\` means **“store,”** not “work out whether two sides are equal.”

🔮 PREDICT THE OUTPUTLook at this two-line program before running it:
\`\`\`python
age = 13
print(age)
\`\`\`
What do you think Python will display?
**Answer:** Python looks inside the variable container labeled \`age\`, finds the stored number \`13\`, and displays: \`13\`. Notice that quotes are NOT printed!`,
                codeSnippet: {
                  language: 'python',
                  code: 'student_name = "Alex"\nstudent_age = 13\nprint("Name:", student_name)\nprint("Age:", student_age)',
                  explanation: 'Assigns values to student_name and student_age, then retrieves them.',
                },
              },
              {
                pageNumber: 7,
                sectionIndex: 2,
                sectionTitle: '3. Variables: Storing Information',
                title: 'Variables in Action & Clean Naming',
                content: `A variable can be used wherever the stored information is needed. Choosing a meaningful name helps another reader understand the program without guessing.

\`\`\`python
game_score = 850
class_temperature = 22.5
print(game_score)
print(class_temperature)
\`\`\`

### Common Variable Names & What They Store

| Variable Name | What It Stores | Good Data Type |
|---|---|---|
| \`student_name\` | A student’s full name | String (\`str\`) |
| \`game_score\` | A player's current score | Integer (\`int\`) |
| \`class_temperature\` | Room temperature reading | Float (\`float\`) |
| \`ticket_price\` | Price of an admission ticket | Float (\`float\`) |

### Variables Can Change Their Value:
🔮 PREDICT THE OUTPUTWhat value will be printed when this code runs?
\`\`\`python
x = 10
x = 20
print(x)
\`\`\`
**Answer:** \`20\`! In Python, variables are changeable (mutable). When \`x = 20\` executes, it replaces the old value \`10\` with the new value \`20\` in the memory box.

🔗 REAL-WORLD CONNECTIONA fitness app stores a user’s step count. A weather system stores temperature. A game stores high scores. Variables are the program’s way of keeping track of information while it works!

### Clean Code Check
- Use a name that explains the value (e.g. \`student_age\` instead of \`a\`).
- Keep naming consistent across your entire program.
- Avoid changing a variable name's meaning halfway through the code.
- Keep related instructions together so the program is easy to scan.`,
              },

              // ==============================================================
              // SECTION 4: Understanding Data Types (Pages 8 - 9)
              // ==============================================================
              {
                pageNumber: 8,
                sectionIndex: 3,
                sectionTitle: '4. Understanding Data Types',
                title: '6. Data Types: The 4 Core Types',
                content: `A data type describes the kind of information stored in a variable. Different kinds of information behave differently, so identifying the type helps you choose the correct operations.

### The Four Fundamental Python Data Types

| Data Type | Example Code | Meaning & Use Case |
|---|---|---|
| **String (\`str\`)** | \`name = "Alex"\` | Text enclosed in quotation marks |
| **Integer (\`int\`)** | \`age = 13\` | A whole number (positive, negative, or zero) |
| **Float (\`float\`)** | \`temperature = 28.5\` | A number with a decimal point |
| **Boolean (\`bool\`)** | \`is_student = True\` | True or False binary state |

💭 WHAT WOULD HAPPEN IF...Look at this sequence of assignments:
\`\`\`python
age = 13
age = "thirteen"
\`\`\`
What changed about the value stored in \`age\`?
**Reasoning:** At first, \`age\` held an integer (\`13\`). On the next line, it was reassigned to a string (\`"thirteen"\`). Python allows this because it has **dynamic typing** — a variable takes on the type of whatever value is stored in it. However, as a best practice, keep a variable storing the same data type throughout your program so the code stays clear and predictable!

### Strings
A string is text inside quotation marks. It can contain letters, spaces, punctuation, or numbers that are being treated as text:
\`\`\`python
school_name = "Northview Academy"
print(school_name)
\`\`\`

🔮 PREDICT THE OUTPUTLook at this assignment:
\`\`\`python
name = "Suriya"
print(name)
\`\`\`
What type of data is stored in \`name\`?
**Answer:** A string (\`str\`). Because \`"Suriya"\` is enclosed in quotes, Python treats it as text.`,
              },
              {
                pageNumber: 9,
                sectionIndex: 3,
                sectionTitle: '4. Understanding Data Types',
                title: 'Integers, Floats, Booleans & Classifications',
                content: `### Integers and Floats
An integer is a whole number, such as \`13\` or \`-4\`. A float is a number with a decimal part, such as \`28.5\` or \`3.75\`. Programs use these types for counts, measurements, prices, and calculations.

\`\`\`python
books_read = 4
water_litres = 1.5
print(books_read)
print(water_litres)
\`\`\`

💭 WHAT WOULD HAPPEN IF...Predict the exact output before running this code:
\`\`\`python
x = 10
y = 2
print(x / y)
\`\`\`
Will Python display \`5\` or \`5.0\`?
**Reasoning:** It displays \`5.0\`! In Python, standard division with the \`/\` operator always produces a float (a decimal number), even when the two numbers divide evenly with no remainder.

### Booleans
A Boolean (\`bool\`) stores one of only two possible values: \`True\` or \`False\` (notice the capital **T** and **F**). Think of a Boolean like a light switch that is either ON or OFF, or an answer to a yes/no question:

\`\`\`python
is_raining = True
game_over = False
print(is_raining)
print(game_over)
\`\`\`

💻 TRY IT YOURSELFClassify each value as a string, integer, float, or boolean:
- \`"Grade 8"\` → String (\`str\`)
- \`42\` → Integer (\`int\`)
- \`7.5\` → Float (\`float\`)
- \`False\` → Boolean (\`bool\`)
- \`"42"\` → String (\`str\`)! Notice that \`42\` and \`"42"\` look similar to humans, but to Python, \`"42"\` is text that cannot be used in mathematical addition!

🧠 THINK LIKE A PROGRAMMERWhy would a temperature of 28.5 need a different data type from a student’s name? What could go wrong if a number were stored as text? (Hint: \`"10" + "10"\` produces \`"1010"\`, not \`20\`!)`,
                codeSnippet: {
                  language: 'python',
                  code: 'books_count = 5          # int\nbook_price = 14.99       # float\ntotal = books_count * book_price\nis_affordable = total < 100 # bool\nprint("Total:", total, "Affordable?", is_affordable)',
                  explanation: 'Combines integer, float, and boolean logic in a single calculation.',
                },
              },

              // ==============================================================
              // SECTION 5: User Input and Output (Pages 10 - 11)
              // ==============================================================
              {
                pageNumber: 10,
                sectionIndex: 4,
                sectionTitle: '5. User Input and Output',
                title: '7. Input and Output in Python',
                content: `Output is information a program displays or produces. You have used \`print()\` to create output. **Input** is information a program receives from a user or another source.

\`\`\`python
name = input("Enter your name: ")
print("Hello", name)
\`\`\`

The \`input()\` function displays a prompt and waits for the user to type a response and press Enter. The response is stored in the variable \`name\`. The second line displays two pieces of information: the text \`Hello\` and the user’s response.

### Input and Data Types: Type Casting
By default, \`input()\` **always stores the user’s response as text (string)**. If you need a number for a calculation, convert the response with:
- \`int()\` for a whole number
- \`float()\` for a decimal number

\`\`\`python
age = int(input("Enter your age: "))
print("Next year you will be", age + 1)
\`\`\`

The \`int()\` conversion changes the typed response into an integer so Python can perform mathematical addition. If you do not use \`int()\`, Python will raise a \`TypeError\` because it cannot add an integer to a string!

🧠 PREDICT THE OUTPUTWhat will the program display after a user enters \`13\`? Write the answer, run the program, and explain the role of \`int()\`.`,
                codeSnippet: {
                  language: 'python',
                  code: 'name = input("Enter your name: ")\nage = int(input("Enter your age: "))\nprint(f"Hello {name}! In 5 years, you will be {age + 5}.")',
                  explanation: 'Uses input() for text and int(input()) for numeric data.',
                },
              },
              {
                pageNumber: 11,
                sectionIndex: 4,
                sectionTitle: '5. User Input and Output',
                title: 'Type Conversion & Clear Prompts',
                content: `### Why Clear Prompts Matter
When you call \`input()\`, the string inside the parentheses is the message the user sees in the terminal.

\`\`\`python
# Confusing prompt:
val = input()

# Professional, clear prompt:
score = int(input("Enter your test score (0-100): "))
\`\`\`

A clear prompt tells the user what format of answer is expected. Notice how we add a space after the colon so the user's cursor does not stick to the text!

### Type Casting Summary Table

| Input Statement | What Happens If User Types '15' | Resulting Type |
|---|---|---|
| \`x = input("Number: ")\` | Stores \`"15"\` (text characters) | \`str\` |
| \`x = int(input("Number: "))\` | Converts \`"15"\` to numerical \`15\` | \`int\` |
| \`x = float(input("Number: "))\` | Converts \`"15"\` to decimal \`15.0\` | \`float\` |

### Try It Yourself
1. Write a program that asks for a favourite subject and displays a sentence containing the answer.
2. Write a second program that asks for the number of hours you studied today and displays that number multiplied by 60 for minutes studied!

✅ GOOD PROGRAMMING HABITMake prompts clear. \`"Enter your favourite subject: "\` tells the user what kind of response is expected. A clear prompt is part of a professional program.`,
              },

              // ==============================================================
              // SECTION 6: Comments, Clean Code & Debugging (Pages 12 - 13)
              // ==============================================================
              {
                pageNumber: 12,
                sectionIndex: 5,
                sectionTitle: '6. Comments, Clean Code & Debugging',
                title: '8. Comments and Naming Conventions',
                content: `A comment is a note for people reading code. Python ignores a comment during execution. A comment begins with \`#\` and can explain a purpose, an important decision, or a section of a program.

\`\`\`python
# Collect the student name
student_name = input("Enter your name: ")
\`\`\`

### Useful Comments vs. Weak Comments

| Useful Comment | Weak Comment | Why |
|---|---|---|
| \`# Convert the response to a whole number\` | \`# Add 1\` | Useful comments explain purpose or reasoning; weak comments just repeat the obvious code. |
| \`# Display the final formatted profile\` | \`# print the profile\` | Comments should explain *why*, not just *what*. |

### Meaningful Variable Names
\`\`\`python
student_name = "Alex"
student_age = 13
math_score = 87
\`\`\`

Use lowercase letters and underscores between words (\`snake_case\`). Choose meaningful names that describe the stored information. Avoid spaces, names that begin with numbers, and names so vague that a reader cannot tell what they represent.

| Good Names | Poor Names | Why the Good Name is Better |
|---|---|---|
| \`student_name\` | \`x\` | The good name describes the value. |
| \`math_score\` | \`thing\` | The good name identifies the exact subject and metric. |
| \`daily_study_hours\` | \`a1\` | The good name is readable weeks later. |

⚡ CHALLENGEImprove these names: \`x\`, \`thing\`, \`n\`, \`class1\`. Give each a useful name for a student profile program. Explain one choice to a partner.

### Organise Code Clearly
A readable program usually follows a visible order:
1. **Header / Title Comments**
2. **Inputs** (collect data)
3. **Processing** (calculations and transformations)
4. **Outputs** (display formatted results)`,
              },
              {
                pageNumber: 13,
                sectionIndex: 5,
                sectionTitle: '6. Comments, Clean Code & Debugging',
                title: '9. Debugging Corner',
                imageUrl: '/images/chapter1/image3.png',
                imageCaption: 'The Five-Step Debugging Process Infographic',
                content: `Errors are a natural part of programming! Debugging means finding, understanding, and fixing a problem. Strong programmers do not fear error messages; they treat them as valuable clues.

### A Five-Step Debugging Process
1. **Read the error message carefully.**
2. **Find the line number** where the problem occurred.
3. **Identify the possible cause**, such as spelling, punctuation, or a wrong name.
4. **Fix one thing at a time.**
5. **Run the program again** and check the result.

### Common Beginner Problems & Solutions

| Problem | What Happened | Solution |
|---|---|---|
| **Misspelled print** | Python does not recognise \`Print\` or \`prnt\`. | Use all-lowercase \`print\`. |
| **Missing quotation mark** | Python cannot find where the string ends. | Check both opening and closing quotes: \`"Hello"\`. |
| **Missing parenthesis** | The instruction is incomplete. | Add the closing \`)\`. |
| **Invalid variable name** | Name starts with a number or contains spaces. | Use \`student_age\` instead of \`student age\`. |
| **Wrong variable name** | Code calls a name that was never stored. | Check spelling and exact capitalization. |

### Syntax Errors vs. Logic Errors
- **Syntax Error**: The code breaks Python’s writing rules (e.g. missing colon or quote). The program refuses to run.
- **Logic Error**: The program runs without crashing, but produces the wrong result (e.g. adding when you meant to subtract).

\`\`\`python
# Spot the two errors:
Print("Starting")
student_name = input("Enter your name: ")
print("Hello", student_nam)
\`\`\`

🔍 DEBUGGING CORNERIn the snippet above: \`Print\` has a capital 'P', and \`student_nam\` is missing the final 'e'. Fix the first error, run again, then fix the second. This demonstrates why debugging happens in stages!`,
                codeSnippet: {
                  language: 'python',
                  code: '# Fixed and clean version:\nprint("Starting")\nstudent_name = input("Enter your name: ")\nprint("Hello", student_name)',
                  explanation: 'Both capitalization and variable name typos are fixed.',
                },
              },

              // ==============================================================
              // SECTION 7: Computational Thinking & Planning (Pages 14 - 15)
              // ==============================================================
              {
                pageNumber: 14,
                sectionIndex: 6,
                sectionTitle: '7. Computational Thinking & Planning',
                title: '10. Computational Thinking',
                content: `Computational thinking is an organized way of tackling complex problems. It does not mean thinking like a robot — it means breaking a problem down so clearly that you (and a computer!) can solve it step by step.

### The Computational Thinking Cycle:
> **UNDERSTAND THE PROBLEM**
> ↓
> **BREAK IT INTO SMALLER STEPS (Decomposition)**
> ↓
> **IDENTIFY INFORMATION NEEDED**
> ↓
> **PLAN THE SOLUTION**
> ↓
> **WRITE CODE → TEST → DEBUG → IMPROVE**

### Case Study: A Student Information Program
Suppose your goal is to create a Student Information Program. Decomposition breaks the large goal into smaller, manageable tasks:
1. **PROBLEM**: Create a Student Information Program.
2. **INFORMATION NEEDED**: Name · Age · Grade · Favourite Subject.
3. **COLLECT**: Use \`input()\` to prompt the user.
4. **DISPLAY**: Print a formatted profile report.

### Think About It
- What information is essential?
- Which information is text (\`str\`) and which is numeric (\`int\`, \`float\`)?
- What should the user see first?
- How will you test the program with different answers?

⭐ IMAGINE THIS...A program is a design that people interact with. A clear question, a sensible order, and a useful result matter just as much as correct punctuation!`,
              },
              {
                pageNumber: 15,
                sectionIndex: 6,
                sectionTitle: '7. Computational Thinking & Planning',
                title: 'Plan Before Coding: Pseudocode & Case Study',
                content: `### Plan Before Coding
Writing a short plan or pseudocode before opening the editor makes your first coding attempt much faster and prevents common logical bugs.

### Example Pseudocode for a Study Planner:
\`\`\`text
1. Ask the user for their name
2. Ask for the subject they want to study today
3. Ask for the study duration in hours
4. Calculate minutes: duration * 60
5. Print: "Student [name] has scheduled [minutes] minutes for [subject]"
\`\`\`

Notice that pseudocode is written in plain English, not strict Python syntax. It focuses purely on the **logic and data flow**.

### Preparing for the 4 Hands-On Coding Labs
In the next sections, you will apply computational thinking to build four complete interactive Python applications:
1. **Lab 1: Simple Calculator** — arithmetic on decimal numbers.
2. **Lab 2: Age Converter** — converting time units using multipliers.
3. **Lab 3: Student Profile System** — collecting multiple fields and printing a formatted card.
4. **Lab 4: Unit Converter** — building conversions with interactive choices.

Turn to the next page to begin **Activity 1: Simple Calculator Lab**!`,
              },

              // ==============================================================
              // SECTION 8: Activity 1: Simple Calculator Lab (Pages 16 - 17)
              // ==============================================================
              {
                pageNumber: 16,
                sectionIndex: 7,
                sectionTitle: '8. Activity 1: Simple Calculator Lab ⚡',
                title: '11. Activity 1: Simple Calculator Walkthrough',
                content: `Build a calculator that asks for two numbers and displays their sum, difference, product, and quotient. This activity combines input, variables, number conversion, arithmetic, and output.

### Goal and Plan
1. Ask the user for two numbers.
2. Convert each response to a decimal number with \`float()\`.
3. Store the responses in meaningful variables.
4. Calculate and display four results.

### Code Walkthrough
\`\`\`python
first_number = float(input("Enter the first number: "))
second_number = float(input("Enter the second number: "))

print("Addition:", first_number + second_number)
print("Subtraction:", first_number - second_number)
print("Multiplication:", first_number * second_number)
print("Division:", first_number / second_number)
\`\`\`

The blank line separates input from output for readability. Each calculation is performed when its \`print()\` instruction runs. Test with whole numbers and decimal numbers.

💻 TRY IT YOURSELFPredict the output for \`8\` and \`2\`. Run the program. Then test \`5.5\` and \`2\`. Explain how the data type affects the results.

⚠️ WATCH OUT!You cannot divide a number by zero in mathematics or in Python!
For example, running:
\`10 / 0\`
will cause Python to stop immediately and report a **\`ZeroDivisionError\`** instead of producing a normal answer. Programs have rules, and unexpected input can cause errors. When testing your calculator, always make sure the second number is not zero!

⚡ CHALLENGEAdd a line that displays the average of the two numbers:
\`\`\`python
average = (first_number + second_number) / 2
print("Average:", average)
\`\`\``,
                codeSnippet: {
                  language: 'python',
                  code: 'first_number = float(input("Enter the first number: "))\nsecond_number = float(input("Enter the second number: "))\nprint("Addition:", first_number + second_number)\nprint("Subtraction:", first_number - second_number)\nprint("Multiplication:", first_number * second_number)\nprint("Division:", first_number / second_number)',
                  explanation: 'Four core arithmetic operations on user-supplied float values.',
                },
              },
              {
                pageNumber: 17,
                sectionIndex: 7,
                sectionTitle: '8. Activity 1: Simple Calculator Lab ⚡',
                title: 'Interactive Coding Lab: Simple Calculator',
                hasCodingPrompt: true,
                codingActivity: ACTIVITY_1_CALC_CONFIG,
                content: `### 🚀 Ready to Build Your Calculator?

You have reviewed the plan and the code walkthrough. Now it's time to build and test your calculator in the live Python environment on the right!

#### What You Will Do:
1. Click **"Open Coding Lab"** below to load your starter project in the right pane.
2. Run the program by clicking the **Run** button (or pressing **Ctrl+Enter**).
3. Type numbers into the terminal when prompted (e.g. \`12\` and \`4\`).
4. Test with decimals like \`15.5\` and \`2.5\`.
5. Complete the **Level-Up Challenge** by printing the average of the numbers!

#### Expected Output Sample:
\`\`\`text
Enter the first number: 12
Enter the second number: 4

--- CALCULATOR RESULTS ---
Addition:       16.0
Subtraction:    8.0
Multiplication: 48.0
Division:       3.0
\`\`\``,
              },

              // ==============================================================
              // SECTION 9: Activity 2: Age Converter Lab (Pages 18 - 19)
              // ==============================================================
              {
                pageNumber: 18,
                sectionIndex: 8,
                sectionTitle: '9. Activity 2: Age Converter Lab ⚡',
                title: '12. Activity 2: Age Converter Walkthrough',
                content: `Create a program that converts a person’s age in years into approximate months, weeks, and days. The results are estimates: a year does not contain exactly the same number of days in every case (due to leap years!), so we label the values as approximations.

### Plan
1. Ask the user for age in whole years.
2. Convert the response to an integer with \`int()\`.
3. Multiply years by 12 for approximate months.
4. Multiply years by 52 for approximate weeks.
5. Multiply years by 365 for approximate days.
6. Display labelled results.

### Code
\`\`\`python
age_years = int(input("Enter your age in years: "))

approximate_months = age_years * 12
approximate_weeks = age_years * 52
approximate_days = age_years * 365

print("Approximate months:", approximate_months)
print("Approximate weeks:", approximate_weeks)
print("Approximate days:", approximate_days)
\`\`\`

The variable names remind the reader that these are approximate values. Multiplication lets one input produce several related results.

🧠 THINK LIKE A PROGRAMMERWhy is the word “approximate” important in the output? What assumption does the program make about the number of days in a year? (Answer: It assumes every year has exactly 365 days, ignoring leap years of 366 days and variable month lengths!)

### Improve It
Change the prompts and labels so the program feels like part of a science or health app. Test two different ages and record the results.`,
                codeSnippet: {
                  language: 'python',
                  code: 'age_years = int(input("Enter your age in years: "))\napprox_months = age_years * 12\napprox_weeks = age_years * 52\napprox_days = age_years * 365\nprint("Months:", approx_months, "| Weeks:", approx_weeks, "| Days:", approx_days)',
                  explanation: 'Multiplies a single age input by 12, 52, and 365.',
                },
              },
              {
                pageNumber: 19,
                sectionIndex: 8,
                sectionTitle: '9. Activity 2: Age Converter Lab ⚡',
                title: 'Interactive Coding Lab: Age Converter',
                hasCodingPrompt: true,
                codingActivity: ACTIVITY_2_AGE_CONFIG,
                content: `### 🚀 Ready to Code the Age Converter?

Open the coding environment on the right to test your program with different ages.

#### Steps:
1. Click **"Open Coding Lab"** below.
2. Run \`main.py\` and enter your age or a family member's age.
3. Observe how Python calculates the months, weeks, and days.
4. Try the extension: calculate **approximate hours lived** (\`approximate_days * 24\`)!

#### Sample Run:
\`\`\`text
Enter your age in years: 13

--- AGE CONVERSION REPORT ---
Approximate months: 156
Approximate weeks:  676
Approximate days:   4745
\`\`\``,
              },

              // ==============================================================
              // SECTION 10: Activity 3: Student Profile System Lab (Pages 20 - 21)
              // ==============================================================
              {
                pageNumber: 20,
                sectionIndex: 9,
                sectionTitle: '10. Activity 3: Student Profile System Lab ⚡',
                title: '13. Activity 3: Student Profile Walkthrough',
                content: `Build a program that collects and displays a concise student profile. This is a practical example of **decomposition**: each question is one input task, and the final display is one output task.

### Code
\`\`\`python
# Collect information for a student profile
student_name = input("Name: ")
student_age = int(input("Age: "))
student_grade = input("Grade: ")
favourite_subject = input("Favourite subject: ")
future_interest = input("Future career or interest: ")

print("--- STUDENT PROFILE ---")
print("Name:", student_name)
print("Age:", student_age)
print("Grade:", student_grade)
print("Favourite subject:", favourite_subject)
print("Future interest:", future_interest)
\`\`\`

The comment describes the purpose of the input section. The variable names explain what each response stores. The headings and labels make the output easier for a reader to scan.

### Test and Review
- Use a short name and a longer name.
- Enter a subject with two words (e.g. \`Computer Science\`).
- Check whether every response appears on the correct line.
- Explain why \`student_age\` is converted to an integer but \`student_name\` is not.

✅ GOOD PROGRAMMING HABITTest normal, short, long, and unexpected inputs. A program that works once is not fully tested. Testing different inputs helps reveal assumptions!`,
                codeSnippet: {
                  language: 'python',
                  code: 'student_name = input("Name: ")\nstudent_age = int(input("Age: "))\nprint(f"--- PROFILE: {student_name} (Age {student_age}) ---")',
                  explanation: 'Collects multiple inputs and prints a unified summary card.',
                },
              },
              {
                pageNumber: 21,
                sectionIndex: 9,
                sectionTitle: '10. Activity 3: Student Profile System Lab ⚡',
                title: 'Interactive Coding Lab: Student Profile',
                hasCodingPrompt: true,
                codingActivity: ACTIVITY_3_PROFILE_CONFIG,
                content: `### 🚀 Ready to Build Your Profile System?

Open the coding environment on the right to create your interactive profile card.

#### Instructions:
1. Click **"Open Coding Lab"** below.
2. Fill in the fields in the Terminal when prompted.
3. Inspect your output card.
4. Complete the optional challenge by adding your favorite game or hobby!

#### Sample Card Output:
\`\`\`text
===============================
       STUDENT PROFILE         
===============================
Name:              Alex Rivera
Age:               13
Grade:             8
Favourite subject: Computer Science
Future interest:   Game Designer
===============================
\`\`\``,
              },

              // ==============================================================
              // SECTION 11: Activity 4: Unit Converter Lab (Pages 22 - 23)
              // ==============================================================
              {
                pageNumber: 22,
                sectionIndex: 10,
                sectionTitle: '11. Activity 4: Unit Converter Lab ⚡',
                title: '14. Activity 4: Unit Converter Walkthrough',
                content: `Create a unit converter. Choose one conversion: kilometres to metres, Celsius to Fahrenheit, or hours to minutes. The distance and time options use simple multiplication, while the temperature option includes a decimal calculation.

### Option A: Kilometres to Metres
\`\`\`python
kilometres = float(input("Enter kilometres: "))
metres = kilometres * 1000
print("Metres:", metres)
\`\`\`

### Option B: Celsius to Fahrenheit
\`\`\`python
celsius = float(input("Enter temperature in Celsius: "))
fahrenheit = (celsius * 9 / 5) + 32
print("Temperature in Fahrenheit:", fahrenheit)
\`\`\`

### Option C: Hours to Minutes
\`\`\`python
hours = float(input("Enter hours: "))
minutes = hours * 60
print("Minutes:", minutes)
\`\`\`

💻 TRY IT YOURSELFChoose one converter. Write the input variable, the calculation variable, and a labelled output. Predict the result for one test value before running it.

⚡ CHALLENGEAdd a reverse conversion (e.g. Fahrenheit back to Celsius: \`(f - 32) * 5 / 9\`) or a second output. Improve the prompts so a user knows the unit expected. Explain one assumption your program makes.`,
                codeSnippet: {
                  language: 'python',
                  code: 'celsius = float(input("Enter °C: "))\nfahrenheit = (celsius * 9 / 5) + 32\nprint(f"{celsius}°C is equal to {fahrenheit}°F")',
                  explanation: 'Applies the scientific temperature conversion formula.',
                },
              },
              {
                pageNumber: 23,
                sectionIndex: 10,
                sectionTitle: '11. Activity 4: Unit Converter Lab ⚡',
                title: 'Interactive Coding Lab: Unit Converter',
                hasCodingPrompt: true,
                codingActivity: ACTIVITY_4_UNIT_CONFIG,
                content: `### 🚀 Ready to Build Your Unit Converter?

Test your conversion formulas in the live Python environment on the right!

#### Instructions:
1. Click **"Open Coding Lab"** below.
2. Select which conversion to run (1, 2, or 3).
3. Try running with:
   - 5 kilometres (should equal 5000 metres)
   - 0 Celsius (should equal 32 Fahrenheit)
   - 100 Celsius (should equal 212 Fahrenheit)
   - 2.5 hours (should equal 150 minutes)
4. Try the challenge: add a reverse converter!

#### Formula Quick Reference:
- **Distance**: \`metres = km * 1000\`
- **Temperature**: \`F = (C * 9 / 5) + 32\`
- **Time**: \`minutes = hours * 60\``,
              },

              // ==============================================================
              // SECTION 12: Chapter Review, Vocabulary & Next Steps (Pages 24 - 26)
              // ==============================================================
              {
                pageNumber: 24,
                sectionIndex: 11,
                sectionTitle: '12. Chapter Review, Vocabulary & Next Steps',
                title: 'Key Vocabulary Glossary',
                content: `### 📚 Chapter 1 Vocabulary Glossary

| Term | Official Definition |
|---|---|
| **Programming** | Designing and writing instructions for a computer. |
| **Program** | A set of instructions a computer can execute to solve a task. |
| **Python** | A readable, high-level programming language used to create programs. |
| **Code** | Instructions written in a programming language. |
| **Variable** | A named container in memory that stores information. |
| **Data type** | A description of the kind of information stored in a variable. |
| **String (\`str\`)** | Text inside quotation marks. |
| **Integer (\`int\`)** | A whole number without a fractional or decimal part. |
| **Float (\`float\`)** | A number with a decimal part. |
| **Boolean (\`bool\`)** | A value that is strictly \`True\` or \`False\`. |
| **Input** | Information received by a program from the user or another source. |
| **Output** | Information displayed or produced by a program. |
| **Comment** | A note for human readers starting with \`#\` that Python ignores. |
| **Syntax error** | A problem caused by code breaking Python’s writing rules. |
| **Logic error** | A problem where code runs but produces an unintended result. |
| **Debugging** | Finding, understanding, and fixing program problems. |
| **Computational thinking** | A structured approach to solving problems step by step. |
| **Decomposition** | Breaking a large, complex problem down into smaller tasks. |`,
              },
              {
                pageNumber: 25,
                sectionIndex: 11,
                sectionTitle: '12. Chapter Review, Vocabulary & Next Steps',
                title: 'Chapter Summary & Final Reflection',
                content: `### KEY TAKEAWAYS
Programming is problem solving. Computers follow precise instructions. Python programs can store information in variables, and different information uses different data types. Programs receive input and produce output. print() displays results, while comments help humans understand code. Meaningful names and clean organisation make programs easier to read. Syntax and logic errors are part of programming, and debugging turns them into clues. Computational thinking helps programmers decompose a problem, plan, test, and improve a solution.

### Final Reflection Prompts
Take a few moments to think about what you learned in this chapter:
1. **Why is programming more than just writing code?**
2. **Why are meaningful variable names important for other programmers?**
3. **How does breaking a problem into smaller steps help you when coding?**
4. **What is one mistake you made while programming today, and how did you fix it?**
5. **Why should programmers test their programs with different kinds of inputs?**
6. **Which activity helped you understand Python the most?**`,
              },
              {
                pageNumber: 26,
                sectionIndex: 11,
                sectionTitle: '12. Chapter Review, Vocabulary & Next Steps',
                title: 'Looking Ahead: Chapter 2 — Operators and Conditions',
                content: `### Looking Ahead: Chapter 2 — Operators and Conditions

You now know how to store information, receive information, process simple calculations, and display results.

Next, you will explore how programs can compare information, make decisions, and respond differently to different situations!

> **YOUR PROGRESSION:**
> 1. Store information (\`variables\`)
> 2. Receive information (\`input()\`)
> 3. Process simple calculations (\`arithmetic\`)
> 4. Display results (\`print()\`)
>
> **COMING IN CHAPTER 2:**
> 1. Compare values (\`==\`, \`!=\`, \`<\`, \`>\`)
> 2. Branch execution with \`if\`, \`elif\`, \`else\`
> 3. Build smart apps that respond dynamically to different conditions!

🎉 **Congratulations! You have completed Chapter 1: Python Fundamentals & Computational Thinking!**`,
              },
            ],
          },
        ],
      },
    ],
  },
];
