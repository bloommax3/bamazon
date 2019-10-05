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

connection.connect(function(err){
    if(err) throw err;
    select()
})

function select(){
    inquirer.prompt({
        name: "selection",
        type: "list",
        message: "What would you like to do?",
        choices: ["View Product Sales by Department", "Create New Department", "Exit"]
    }).then(function(select){
        switch(select.selection){
            case "View Product Sales by Department":
                totalSalesUpdater()
            break;
            case "Create New Department":
                newDepartment()
            break;
            case "Exit":
                connection.end()
            break;
        }
    })
}

function newDepartment(){
    inquirer.prompt([
        {
            name: "deptName",
            message: "What is the name of the department you want to add?"
        },
        {
            name: "deptCost",
            message: "What is the overhead cost of the department?"
        }
    ]).then(function(dept){
        connection.query("SELECT department_name FROM departments", function(err, res){
            if(err) throw err;
            for(let i=0; i<res.length; i++){
                if(res[i].department_name!==dept.deptName && i===res.length-1){
                    connection.query("INSERT INTO departments SET ?", {
                        department_name: dept.deptName,
                        over_head_costs: dept.deptCost,
                        net_revenue: parseFloat(dept.deptCost)*-1
                    }, function(err){
                        if(err) throw err;
                        console.log("Department successfully added!")
                        select()
                    })
                }
                else if(res[i].department_name==dept.deptName){
                    console.log("This department already exists")
                    select()
                    return;
                }
            }
        })
    })
}

function totalSalesUpdater(){
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw err;
        connection.query("SELECT * FROM departments", function(error, result){
            if (error) throw error;
            for(let n=0; n<result.length; n++){
                for(let i=0; i<res.length; i++){
                    connection.query("UPDATE departments SET ? WHERE ?",[
                        {
                            total_sales: (parseFloat(res[i].price)*parseFloat(res[i].product_sales))+result[n].total_sales
                        },
                        {
                            department_name: res[i].department_name
                        }
                    ], function(er){
                        if(er) throw er;
                        if(n===result.length-1 && i===res.length-1){
                            netRevenueUpdater()
                        }
                    })
                }
            }
        })
    })
}

function netRevenueUpdater(){
    connection.query("SELECT * FROM departments", function(err, res){
        if(err) throw err;
        for(let i=0; i<res.length; i++){
            connection.query("UPDATE departments SET ? WHERE ?",[
                {
                    net_revenue: parseFloat(res[i].total_sales)-parseFloat(res[i].over_head_costs)
                },
                {
                    department_id: i+1
                }
            ], function(err){
                if(err) throw err;
                if(i===res.length-1){
                    departmentViewer()
                }
            })
        }
    })
}

function departmentViewer(){
    connection.query("SELECT * FROM departments", function(err, res1){
        if(err) throw err;
        tableMaker(res1)
    })
}

function tableMaker(resin){
    var table = new Table({
        head: ["ID", "Department", "Overhead Costs", "Total Sales", "Net Income"],
        colWidths: [5, 25, 20, 10, 20]
    })
    for(let n=0; n<resin.length; n++){
        let temp = resin[n]
        table.push(
            [temp.department_id, temp.department_name, temp.over_head_costs, temp.total_sales, temp.net_revenue]
        )
        if(n===resin.length-1){
            console.log(table.toString())
            continuer()
        }
    }
}

function continuer(){
    inquirer.prompt({
        type: "confirm",
        name: "continue",
        message: "Would you like to do anything else?"
    }).then(function(response){
        if(response.confirm===true){
            select()
        }
        else{
            connection.end()
        }
    })
}