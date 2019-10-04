var mysql = require("mysql")
var inquirer = require("inquirer")
var Table = require('cli-table');
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

function addToInventory(){
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        tableMaker(res);
        inventoryAdder()
    })
}

function viewForSale(){
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        tableMaker(res)
        finished()
    })
}

function viewLowInventory(){
    connection.query("SELECT * FROM products WHERE stock_quantity BETWEEN 0 AND 5", function(err, res){
        if (err) throw err;
        tableMaker(res)
        continuer()
    })
}

function inventoryAdder(){
    inquirer.prompt([
        {
            name: "productId",
            message: "What is the ID of the item you would like to add to?"
        },
        {
            name: "addSupply",
            message: "How many of this product would you like to add?"
        }
    ]).then(function(selection){
        connection.query("SELECT * FROM products WHERE ?",{
            item_id: selection.productId
        },function(error, res){
            if (error) throw error;
            let newQuantity = res[0].stock_quantity+parseFloat(selection.addSupply);
            connection.query("UPDATE products SET ? WHERE ?",[
                {
                    stock_quantity: newQuantity
                },
                {
                    item_id: parseFloat(selection.productId)
                }
            ], function(error1){
                if (error1) throw error1;
                console.log("Items successfully added!")
                continuer()
            })
        })
    
    })
}

function continuer(){
    inquirer.prompt({
        name: "redirect",
        type: "confirm",
        message: "Would you like to add more to your inventory?"
    }).then(function(response){
        if(response.redirect===true){
            inventoryAdder()
        }
        else{
            finished()
        }
    })
}

function finished(){
    inquirer.prompt({
        name: "else",
        message: "Would you like to do anything else?",
        type: "confirm"
    }).then(function(response){
        if(response.else===true){
            select()
        }
        else{
            connection.end()
        }
    })
}

function tableMaker(res){
    var table = new Table({
        head: ["ID", "Item", "Department", "Price", "Quantity in Stock", "Products Sold"],
        colWidths: [5, 25, 20, 10, 20, 17]
    })
    for(let n=0; n<res.length; n++){
        let temp = res[n]
        table.push(
            [temp.item_id, temp.product_name, temp.department_name, temp.price, temp.stock_quantity, temp.product_sales]
        )
        if(n===res.length-1){
            console.log(table.toString())
        }
    }
}