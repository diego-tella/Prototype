const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');  
const pug = require('pug');
const unflatten = require('unflatten')
const app = express();
const port = 1337;

app.use(cookieParser());

const secret = "test";

app.use(express.json());

app.get('/admin', (req, res) => {


    if(req.cookies.auth){
        try {
            const decoded = jwt.verify(req.cookies.auth, secret);
            if(decoded.user = 'admin' && decoded.isActive == true){
                res.sendFile(__dirname + '/static/admin/dashboard/index.html');
            }
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(400).send({"status":"error","msg":"Token expirado"});
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(400).send({"status":"error","msg":"Token invalido"});
            } else {
                return res.status(400).send({"status":"error","msg":"Erro ao verificar o token"});
            }
        }
    }else{
        res.sendFile(__dirname + '/static/admin/src/index.html');
    }
});

app.post('/api/checkUser', (req, res) => {
    const userInput = req.body;
    
    if ('isActive' in userInput) {
        return res.status(400).send({"status":"error","msg":"Parameter 'isActive' is not allowed"});
    }
    
    const data = unflatten(req.body);
    if(data.user == 'admin' && data.password == 'root'){
        
        if(data.isActive == true){
            const token = jwt.sign({ user:data.user,isActive:data.isActive }, secret, {
                expiresIn: 60000 
              });
              
            return res.status(200).send({"status":"success","msg":token });
        }else{
            return res.status(400).send({"status":"error","msg":"User admin is not enabled"});
        }
    }else{
        return res.status(401).send({"status":"error","msg":"Invalid credentials"});
    }

    
});


app.get('/api/getmsg', (req, res) => {
    if(req.cookies.auth){
        try {
            const decoded = jwt.verify(req.cookies.auth, secret);
            if(decoded.user = 'admin' && decoded.isActive == true){
                return res.json({
                    'response': pug.compile('span Hello #{user}, Welcome back! ')({ user: 'admin' })
                });
            }
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(400).send({"status":"error","msg":"Token expirado"});
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(400).send({"status":"error","msg":"Token invalido"});
            } else {
                return res.status(400).send({"status":"error","msg":"Erro ao verificar o token"});
            }
        }
    }else{
        return res.status(400).send({"status":"error","msg":"Token não encontrado"});
    }

    
});


app.get('/', (req, res) => {
    
        res.sendFile(__dirname + '/static/generator/index.html');

});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});