var express = require('express');
var mysql = require('mysql');
var cors = require("cors");
var bodyParser = require('body-parser');
var { error } = require('console');
const nodemailer = require('nodemailer');
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

app.get('/api/login/:correo/:contra', (req,res) =>{
    const{correo, contra} = req.params;
    const sql = `SELECT * from usuarios where (CORREO = '${correo}' AND CONTRASENA = '${contra}')`;
    connection.query(sql,(error,results)=>{
        if(error) throw error;
        if(results.length > 0){
            res.json(results)
        }else{
            res.json([])
        }
    })
});

app.get('/api/verif/:correo', (req,res) =>{
    const{correo, contra} = req.params;
    const sql = `SELECT * from usuarios where CORREO = '${correo}' `;
    connection.query(sql,(error,results)=>{
        if(error) throw error;
        if(results.length > 0){
            res.json(results)
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
            results.forEach(function(result) {
                result.FOTO = `data:image/png;base64,${result.FOTO.toString('base64')}`;
             });
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
            results.forEach(function(result) {
                result.FOTO = `data:image/png;base64,${result.FOTO.toString('base64')}`;
             });
            res.json(results);
         }else{
             res.json('nada');
         }
     })
 });

app.post('/api/crear-cuenta',(req,res)=>{
    const{NOMBRE,APELLIDO,CORREO,NUM_CELULAR,CONTRASENA} = req.body;
    const sql = `insert into usuarios(NOMBRE,APELLIDO,CORREO,NUM_CELULAR,CONTRASENA) values('${NOMBRE}','${APELLIDO}','${CORREO}','${NUM_CELULAR}','${CONTRASENA}')`;
    connection.query(sql,(error,results)=>{
        if(error) throw error
        else{
            res.json({status : 'usuario creado', data : results})
        }
    });

});

app.post('/api/insertar-boleto', (req,res) =>{
    const{id_evento,NoSilla,id_zona,precio} = req.body;
    cons = 0;
    const sqlVerf = `select * from detalle_evento where (ID_EVENTO = '${id_evento}' AND NoSilla = '${NoSilla}')`;
    connection.query(sqlVerf,(error,results)=>{
        if (error) throw error;
        if(results.length > 0){
            res.json({status:'ya hay un registro con los datos ingresados'});
            cons = 1;
            
        }else{
            const sql = `insert into detalle_evento(ID_EVENTO,NoSilla,ID_ZONA,STATUS,PRECIO) values(${id_evento},'${NoSilla}',${id_zona},'D',${precio})`;
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
    const{id_usuario,tipo_pago,total} = req.body;
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
    const{id_evento,noSilla,id_usuario,id_compra} = req.body;
    const sql = `UPDATE detalle_evento SET id_usuario= ${id_usuario} ,id_compra = ${id_compra} , status = 'O' WHERE ID_EVENTO = '${id_evento}' AND NoSilla = '${noSilla}'`
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


app.get('/api/hacientos/:id', (req,res) =>{
    // const  { usuario } = req.params;
     const sql = `SELECT * FROM detalle_evento where ID_EVENTO = '${req.params.id}' order by NoSilla ASC`;
     connection.query(sql,(error,results)=>{
         if(error) throw error;
         if(results){
            res.json(results);
         }else{
             res.json('nada');
         }
     })
 });

 app.post('/api/sendMail', (req, res) => {
    const{correo,evento,fecha,total,asientos} = req.body;
    var fechaParam = new Date(fecha);
    var today = new Date();
    // `getDate()` devuelve el día del mes (del 1 al 31)
    var day = today.getDate();
 
    // `getMonth()` devuelve el mes (de 0 a 11)
    var month = today.getMonth() + 1;
 
    // `getFullYear()` devuelve el año completo
    var year = today.getFullYear();

    var fechaActual = year + "-" + month + "-" + day;

    var dia = fechaParam.getDate();
    var mes = fechaParam.getMonth() + 1;
    var anio = fechaParam.getFullYear();
    var fechaEvento = anio + "-" + mes + "-" + dia;

    var transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
        user: 'mindows123@live.com.mx', // Cambialo por tu email
        pass: '1655597' // Cambialo por tu password
        }
        });
       const mailOptions = {
        from: `mindows123@live.com.mx`,
        to: `${correo}`, // Cambia esta parte por el destinatario
        subject: `Confimacion compra boletos ${evento}`,
        html: `
        <strong>Nombre del evento:</strong> ${evento} <br/>
        <strong>Fecha del evento:</strong> ${fechaEvento} <br/>
        <strong>Fecha de compra:</strong> ${fechaActual}<br/>
        <strong>Total:</strong> $${total}<br/>
        <strong>Asientos:</strong> ${asientos}<br/>
        `
        };
       transporter.sendMail(mailOptions, function (err, info) {
        if (err)
        console.log(err)
        else
        console.log(info);
        });
        res.status(200).send();
 });

