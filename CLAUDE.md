   # Critial Patterns:
	- DO NOT IMPLEMENT EXTRA FEATURES 
	- the second rule for claude code is DO NOT IMPLEMENT EXTRA FEATURES
	- to clarify, we are trying to take small feature sized bites, and make sure that they work at every stage. If I tell you to move file XYZ.js and to new/XX.js and then fix refrences to it, DO NOT REFACTOR XYZ.js, just do the minimum amount you need to to get the move working. If I want you to/ refactor XYZ.js. EVEN IF REFACTORING IT IS ON YOUR TODO LIST, don't do it until I ask. 
	- our patter with github will be "check in what I just reviewed from last time, then work on the new thing I assign" Do NOT check in after you finish a task, check in after I verify that the task is working. 

   # Common bash commands
	- 
   # Core files and utility functions
	-Be sure to have a look at DesginDocs to know where you are headed

   # Code style guidelines
	- Keep code simple to read, and in a language agnostic style. (I.E. minimal syntactic sugar, Mostly loops and objects)
	- Add comments to lines, explaining the WHY of whats happening, not the WHAT of what is happening
	- Break code into multiple small files. Try to keep files quite small ( 1200 tokens at most)

   # Testing instructions
	- Write both Unit tests and Integration tests BEFORE writing code. we are using TDD
	- Make sure you Lint code before testing it. Make sure it compiles.
	- Do not commit code until it passes all tests
	- Make sure that you test edge-cases 
 
   # Repository etiquette (e.g., branch naming, merge vs. rebase, etc.)
	- For now, we are going to just use a single branch, so feel free to checkout and commit to master

   # Developer environment setup (e.g., pyenv use, which compilers work)
   # Any unexpected behaviors or warnings particular to the project
   #  Other information you want Claude to remember
	- We are going to be working on making very minimal steps each time. No huge leaps on features
	- If a request feels like it takes a large amount of code, then feel free to push back, and propose a smaller sub-feature
