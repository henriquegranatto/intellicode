import axios from "axios";
import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js"

const socket = io('http://localhost:3000')

socket.on("status", (message) => {
    document.querySelector("#status").innerHTML = `<h3>${message}</h3>`
})

socket.on("complete", (report) => {
    console.log(report)
    const markdown = new showdown.Converter()
    const code = markdown.makeHtml(report.analysis.content.replace(/\\/g, "\\\\"))

    const data = 
    `
        <h3>${report.file} - ${report.method}</h3>
        <br>
        ${code}    
    `    

    document.querySelector("#report").innerHTML = data
    document.querySelector("#form").style.display = "none"
    document.querySelector("#status").style.display = "none"
    document.querySelector("#report").style.display = "block"
})

window.analyze = async () =>
{
    document.querySelector("#form").style.display = "none"

    const repository = document.querySelector("#repository").value;

    const report = await axios({
        method: "post",
        data: {repository: repository },
        url: `http://localhost:3000/analyze`,
    });

    document.querySelector("#status").innerHTML = `<h3>Iniciando...</h3>`
    document.querySelector("#form").style.display = "none"
    document.querySelector("#report").style.display = "none"
    document.querySelector("#status").style.display = "block"
}