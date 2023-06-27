var express = require('express');
var mysql = require('mysql');
var cors = require("cors");
var bodyParser = require('body-parser');
var { error } = require('console');
var app = express();
var port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createPool({
    host: 'localhost', 
    user:'root',
    password:'1655597',
    database:'bd_eventuki'
});

app.listen(port, () => console.log(`Servidor corriendo en puerto ${port}`));

var cons = 0;


app.get('/api/even', (req,res) =>{
    res.send('Welcome api eventuki!');
});

app.post('/api/login', (req,res) =>{
    const{celular} = req.body;
    const sql = `SELECT * from usuarios where (NUM_CELULAR = '${celular}')`;
    connection.query(sql,(error,results)=>{
        if(error) throw error;
        if(results.length > 0){
            res.json({status:'iniciaste sesion'})
        }else{
            res.json([])
        }
    })
});

app.get('/api/eventos', (req,res) =>{
    // const  { usuario } = req.params;
     const sql = `SELECT * FROM eventos where STATUS = 'A'`;
     connection.query(sql,(error,results)=>{
         if(error) throw error;
         if(results){
            res.json(results);
         }else{
             res.json('nada');
         }
     })
 });

 app.get('/api/eventos/:id', (req,res) =>{
    // const  { usuario } = req.params;
     const sql = `SELECT * FROM eventos where STATUS = 'A' AND ID_EVENTOS = '${req.params.id}'`;
     connection.query(sql,(error,results)=>{
         if(error) throw error;
         if(results){
            res.json(results);
         }else{
             res.json('nada');
         }
     })
 });

app.post('/api/insertar-boleto', (req,res) =>{
    const{id_evento,column,row,id_zona,precio} = req.body;
    cons = 0;
    const sqlVerf = `select * from detalle_evento where (ID_EVENTO = '${id_evento}' AND COLUMNA = '${column}' AND FILA = '${row}')`;
    connection.query(sqlVerf,(error,results)=>{
        if (error) throw error;
        if(results.length > 0){
            res.json({status:'ya hay un registro con los datos ingresados'});
            cons = 1;
            
        }else{
            const sql = `insert into detalle_evento(ID_EVENTO,COLUMNA,FILA,ID_ZONA,STATUS,PRECIO) values(${id_evento},'${column}','${row}',${id_zona},'D',${precio})`;
            connection.query(sql,(error,results)=>{
                if(error) throw error
                else{
                    res.json({status : 'boleto creado', data : results})
                }
            });
        }   
        
    });
});

app.post('/api/insertar-compra', (req,res) =>{
    const{id_usuario,id_detalle,tipo_pago,total} = req.body;
    var today = new Date();
    // `getDate()` devuelve el día del mes (del 1 al 31)
    var day = today.getDate();
 
    // `getMonth()` devuelve el mes (de 0 a 11)
    var month = today.getMonth() + 1;
 
    // `getFullYear()` devuelve el año completo
    var year = today.getFullYear();

    var fechaActual = year + "-" + month + "-" + day;
    var codigo = generarCodigo();
    const sql = `insert into compras(ID_USUARIO,CODIGO_COMPRA,TIPO_PAGO,TOTAL,FECHACOMPRA) values(${id_usuario},'${codigo}','${tipo_pago}',${total},'${fechaActual}')`;
            connection.query(sql,(error,results)=>{
                if(error) throw error
                else{
                    res.json(results)
                }
            });
});

app.put('/api/compra-boleto', (req,res) =>{
    const{id_detalle,id_usuario,id_compra} = req.body;
    const sql = `UPDATE detalle_evento SET id_usuario= ${id_usuario} ,id_compra = ${id_compra} , status = 'O' WHERE id_detalle = ${id_detalle}`
    //const sql = `insert into detalle_evento(ID_USUARIO,CODIGO_COMPRA,TIPO_PAGO,TOTAL,FECHACOMPRA) values(${id_usuario},'${codigo}','${tipo_pago}',${total},'${fechaActual}')`;
            connection.query(sql,(error,results)=>{
                if(error) throw error
                else{
                    res.json(results)
                }
            });
});


function generarCodigo() {
    var mapa = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      codigo = '',
      i = 0;
  
    for(i; i < 6; i++) {
        codigo += mapa.charAt(Math.floor(Math.random() * mapa.length));
    }
    return codigo;
}


