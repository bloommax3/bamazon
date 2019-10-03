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

connection.connect(function(err) {
    if (err) throw err;
    select()
});

function select(){
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw err;
        console.log(res)
        inquirer.prompt([
            { 
                name: "purchaseId",
                message: "What is the ID of the product you would like to buy?"
            },
            {
                name: "purchaseQuantity",
                message: "How many of this item would you like to buy?"
            }
        ]).then(function(selection){
            connection.query("SELECT * FROM products WHERE ?",{
                item_id: selection.purchaseId
            },function(error, res){
                if (error) throw error;
                let quantity = res[0].stock_quantity;
                let newQuantity = res[0].stock_quantity-selection.purchaseQuantity;
                let sales = res[0].product_sales+selection.purchaseQuantity;
                if(quantity>=selection.purchaseQuantity){
                    connection.query("UPDATE products SET ? WHERE ?",[
                        {
                            product_sales: sales,
                            stock_quantity: newQuantity
                        },
                        {
                            item_id: parseFloat(selection.purchaseId)
                        }
                    ], function(error1){
                        if (error1) throw error1;
                        continuer()
                    })
                }
                else{
                    console.log("Insufficient quantity!")
                    continuer()
                }
            })
        })
    })
}
function continuer(){
    inquirer.prompt({
        name: "continue",
        message: "Would you like to buy anything else?",
        type: "confirm"
    }).then(function(response){
        if(response.continue===false){
            connection.end()
        }
        else{
            select()
        }
    })
}