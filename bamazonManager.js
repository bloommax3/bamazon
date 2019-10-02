var mysql = require("mysql")
var inquirer = require("inquirer")
var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "rootroot",
    database: "bamazon_db"
});

connection.connect(
    function(err) {
        if (err) throw err;
        select()
    }
);

function select(){
    inquirer.prompt({
        name: "action",
        message: "What would you like to do?",
        type: "list",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    }).then(function(selection){
        switch(selection.action){
            case "View Products for Sale":
                viewForSale()
            break;
            case "View Low Inventory":
                viewLowInventory()
            break;
            case "Add to Inventory":
                addToInventory()
            break;
            case "Add New Product":
                newProduct()
            break;
            case "Exit":
                connection.end()
            break;
        }
    })
}

function newProduct(){
    inquirer.prompt([
        {
            name: "productName",
            message: "What is the name of this product?"
        },
        {
            name: "productDepartment",
            message: "What department is this product in?"
        },
        {
            name: "productPrice",
            message: "What is the price for this product?"
        },
        {
            name: "productQuantity",
            message: "How many of this product are in stock?"
        }
    ]).then(function(response){
        connection.query("INSERT INTO products SET ?",{
            product_name: response.productName,
            department_name: response.productDepartment,
            price: response.productPrice,
            stock_quantity: response.productQuantity
        },function(err, res){
            if (err) throw err;
            console.log(res.affectedRows + " product added!\n");
            select()
        })
    })
}