DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products(
item_id INT NOT NULL AUTO_INCREMENT,
product_name VARCHAR(255) NOT NULL,
department_name VARCHAR(255) NOT NULL,
price INT NOT NULL,
stock_quantity INT NOT NULL,
product_sales INT NOT NULL DEFAULT 0,
PRIMARY KEY(item_id)
);

CREATE TABLE departments(
department_id INT NOT NULL AUTO_INCREMENT,
department_name VARCHAR(255) NOT NULL,
over_head_costs INT NOT NULL,
total_sales INT NOT NULL DEFAULT 0,
net_revenue INT NOT NULL,
PRIMARY KEY(department_id)
);