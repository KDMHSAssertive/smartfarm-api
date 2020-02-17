const mysql = require("mysql");
const util = require("../util");

function mysql_query(q_comm) {

    const conn_mysql = mysql.createConnection({
        host: "222.117.33.139",
        user: "smartfarmAPI",
        password: "APIPW123!@#",
        port: 3306,
        database: "assertiveAPI"
    });

    conn_mysql.connect();

    return new Promise((resolve, reject) => {
        conn_mysql.query(q_comm, (err, rows, fields) => {
            if (err) reject("Query ERR: " + err);
            else resolve(rows);
        })
    })
}

function test() {
    mysql_query("show tables")
    .then((res) => {
        console.log(res);
        if (res.length != 0) {
            console.log("Connected to Mysql DB. Total table number is " + res.length);
        }
    })
    .catch((err) => {
        console.log(err);
    })
}


// const Insert = (table, data:{columns: Object, values: Object}, done) => {
const Insert = (table, data, done) => {
    mysql_query("INSERT INTO " + table + " (" + data.columns.toString() + ") VALUES (" + data.values.toString() + ")")
    .then((res_sql) => {
        return done(null, res_sql);
    })
    .catch((e) => {
        return done(e);
    })
}

// const Update = (table, base:{columns: String, values: String}, alter: String, done) => {
const Update = (table, base, alter, done) => {
    mysql_query("UPDATE " + table + " SET " + base.columns + " = " + alter + " WHERE " + base.columns + " = " + base.values)
    .then((res_sql) => {
        return done(null, res_sql);
    })
    .catch((e) => {
        return done(e);
    })
}
// const Alter = (type: String, table: String, column: String, data: String, done) => {
const Alter = (type, table, column, data, done) => {
if (type == "add" || type == "modify") {
        if (!table || !column || !data) return done(new Error("Required variable not defined properly"))
        mysql_query("ALTER table " + table + " " + type + " " + column + " " + data)
        .then((res_sql) => {
            return done(null, true);
        })
        .catch((e) => {
            return done(e);
        })
    } else return done(new Error("Invalid type: " + type));
}
// const Read = (table: String, output: Object, filter: {columns: String, values: String}, done) => {
const Read = (table, output, filter, done) => {
    // console.log(table);
    // console.log(output);
    // console.log(filter);
    let command = "SELECT " + (!output ? "*" : output.toString()) + " FROM " + table;
    // console.log(command);
    if (typeof filter.columns == "Array") {
        command += " WHERE ";
        filter.columns.forEach(element => {
            command += element + "=" + (util.isNumber(filter.values[filter.columns.indexOf(element)]) ? filter.values[filter.columns.indexOf(element)] : "'" + filter.values[filter.columns.indexOf(element)] + "'");
            if (filter.columns.indexOf(element) != filter.columns.length-1) command += " AND ";
        });
    } else if (filter.columns != "" || !filter.columns) {
        command += " WHERE " + filter.columns + "=" + (util.isNumber(filter.values) ? filter.values : "'" + filter.values + "'");
    }

    // console.log(command);

    mysql_query(command)
    .then((res_sql) => {
        // return done(null, res_sql.length == 1 ? res_sql[0] : res_sql);
        return done(null, res_sql);
    })
    .catch((e) => {
        return done(e);
    })
}
// const Delete = (table, filter: {columns: String, values: String}, done) => {
const Delete = (table, filter, done) => {
    mysql_query("DELETE FROM " + table + " WHERE " + filter.columns + " = " + filter.values)
    .then((res_sql) => {
        return done(null, true);
    })
    .catch((e) => {
        return done(e);
    })
}

module.exports = {
    Insert,
    Update,
    Alter,
    Read,
    Delete,
    test
}