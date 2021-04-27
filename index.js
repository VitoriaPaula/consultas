const express = require("express");
const app = express();
app.use(express.json());
const axios = require("axios");
const baseConsulta = {};
const funcoes = {
    ClienteCriado: (cliente) => {
        console.log("Entrou no Cliente Criado")
        if (Object.keys(baseConsulta).length === 0){
            baseConsulta[cliente.contador] = cliente;
            baseConsulta[cliente.contador]["ingressos"] = [];
        } else if (baseConsulta[cliente.contador] != null && baseConsulta[cliente.contador]["ingressos"].length > 0){
            const ingressos = baseConsulta[cliente.contador]["ingressos"];
            baseConsulta[cliente.contador] = cliente;
            baseConsulta[cliente.contador]["ingressos"] = ingressos;
        } else {
            baseConsulta[cliente.contador] = cliente;
            baseConsulta[cliente.contador]["ingressos"] = [];
        }
    },
    ClienteDeletado: (id) => {
        console.log("Entrou no Cliente Deletado");
        axios.post('http://localhost:10000/eventos', {
                tipo: "ClienteDeletadoComIngressos",
                dados: {
                    id: id 
                }
        });
        delete baseConsulta[id];
    }, 
    IngressoCriado: (ingresso) => {
        console.log("Entrou no Ingresso Criado")
        const ingressos = 
            baseConsulta[ingresso.clienteId]["ingressos"] || [];
            ingressos.push(ingresso);
            baseConsulta[ingresso.clienteId]["ingressos"] = 
            ingressos;
            baseConsulta[ingresso.clienteId].quantIngressos = 
            ingressos.length;

        axios.post('http://localhost:10000/eventos', {
                tipo: "ClienteComIngressos",
                dados: {
                    id: ingresso.clienteId,
                    quant: baseConsulta[ingresso.clienteId].quantIngressos
                }
        });
    },
    IngressoDeletado: (id) => {
        console.log("Entrou no Ingresso Deletado")
        const len = baseConsulta[id]["ingressos"].length;
        baseConsulta[id]["ingressos"].splice(len-1, 1)
        baseConsulta[id].quantIngressos = baseConsulta[id]["ingressos"].length;

        axios.post('http://localhost:10000/eventos', {
                tipo: "ClienteComIngressos",
                dados: {
                    id: id,
                    quant: baseConsulta[id].quantIngressos
                }
        });
    },
};

app.get("/clientes", (req, res) => {
    res.status(200).send(baseConsulta);
});
app.post("/eventos", (req, res) => {
    try {
        funcoes[req.body.tipo](req.body.dados);
    } catch (err) {}
    res.status(200).send(baseConsulta);
});
app.listen(6000, async() => {
    console.log("Consultas. Porta 6000");
    // const resp = await axios.get("http://localhost:10000/eventos");
    // resp.data.forEach((valor, indice, colecao) => {
    //     try {
    //         funcoes[valor.tipo](valor.dados);
    //     } catch (er) {}
    // });
});