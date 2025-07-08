const fs= require('fs')
const path = './expense.json'
const budgetPath = './budget.json'
const csvPath = './expense.csv'

if(!fs.existsSync(path)){
   fs.writeFileSync(path, JSON.stringify([]))
}

if(!fs.existsSync(budgetPath)){
   fs.writeFileSync(path, JSON.stringify({
      "monthlyBudget": 0
    }, null, 2
    ))
}

const args = process.argv.slice(2)
const command = args[0]

const readExpense = () => {
   if (fs.existsSync(path) && fs.statSync(path).size > 0) {
     const data = fs.readFileSync(path, 'utf8');
     return JSON.parse(data);
   }
   return []; // Return an empty array if the file is empty or doesn't exist
 }

const writeExpense = (expenses) => {
   fs.writeFileSync(path, JSON.stringify(expenses, null , 2))
}

const readBudget = () => {
   const data = fs.readFileSync(budgetPath, 'utf8')
   return JSON.parse(data)
}

const writeBudget = (budget) => {
    fs.writeFileSync(budgetPath, JSON.stringify(budget, null, 2))
}

// function to add nex expense to json file
const addExpense = (description, amount, category) => {
   const expenses = readExpense();
   const newExpense = {
     id: expenses.length ? expenses[expenses.length - 1].id + 1 : 1,
     description,
     amount: parseFloat(amount),
     category,
     createdAt: new Date().toISOString()
   };
   expenses.push(newExpense);
   writeExpense(expenses);
   console.log(`Added expense: "${description}" with amount $${amount} in category: ${category}`);
 }
const deleteExpense = (id) => {
   let expenses = readExpense()
   expenses = expenses.filter(expense => expense.id !== parseInt(id))
   writeExpense(expenses)
   console.log(`Delete expenese with id: ${id}`)
}

const listExpense = () => {
   const expenses = readExpense()
   console.log(expenses)
}
const viewSummary = () => {
   const expenses = readExpense()
   const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
   console.log(`Total Expenses : $${total}`)

}

const listByCategory = (category) => {
   const expenses = readExpense()
   const filtered = expenses.filter((expense) => expense.category === category)
   console.log(`Expense in catogory "${category}":`, filtered)
}

const setBudget = (amount) => {
   const budget = readBudget()
   budget.monthlyBudget = parseFloat(amount)
   writeBudget(budget)
   console.log(`Monthly budget set to $${amount}`)
}


const checkBudget = () => {
   const expenses = readExpense()
   const budget = readBudget().monthlyBudget

   //calculate total expenses exceed the budget
   const currentMonth = new Date().getMonth()
   const totalThisMonth = expenses.reduce((sum, expense) => {
      const expenseData = new Date(expense.createdAt)
      if(expenseData.getMonth() === currentMonth){
         return sum + expense.amount
      }
      return sum;
   }, 0     
)
console.log(`Total expenses for this month: $${totalThisMonth}`);
console.log(`Monthly budget: $${budget}`);

// Check if expenses exceed the budget
if (totalThisMonth > budget) {
  console.warn(`Warning: You have exceeded your monthly budget by $${(totalThisMonth - budget).toFixed(2)}!`);
} else {
  console.log('You are within your budget.');
}
}

const exportToCsv = () => {
   const expenses = readExpense()
   const headers = `ID, Description, Amount, Category, CreatedAt\n`
   const rows = expenses.map(expense => `${expense.id}, ${expense.description}, ${expense.amount}, ${expense.createdAt}, ${expense.category}.join('\n)`)
   
   const csvData = headers + rows
   fs.writeFileSync(csvPath, csvData)
   console.log(`Expense exported to ${csvPath}`)
}


// handle command switching
switch (command) {
   case 'add':
     addExpense(args[1], args[2],args[3]); // Corrected argument indices
     break;
   case 'delete':
     deleteExpense(args[1]);
     break;
   case 'list':
     listExpense();
     break;
   case 'summary':
     viewSummary();
     break;
   case 'listByCategory':
      listByCategory(args[1])
      break;
   case 'setBudget':
      setBudget(args[1]); // Set the monthly budget
      break;
   case 'checkBudget':
      checkBudget(); // Check if the expenses exceed the budget
      break;
   case 'exportCSV':
      exportToCsv()
      break;
   default:
      console.log('Available commands: add, delete, list, summary, listByCategory, setBudget, checkBudget');
   }
 