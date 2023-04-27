const express = require('express');
const { Liquid } = require('liquidjs');
const fs = require('fs');
const axios = require('axios');
const app = express();
const port = 3000;
const engine = new Liquid({
    cache: false
});

/* template engine setup */
app.engine('liquid', engine.express());
app.set('views', './templates');
app.set('view engine', 'liquid');

app.use(express.urlencoded({
    extended: true
}))

app.post('/new-template', (req, res) => {
    const template = req.body.template.endsWith('.liquid') ? req.body.template : req.body.template + '.liquid';
    fs.writeFileSync('./templates/' + template, "{% layout 'shell/root.liquid' %}\n" +
        "{% block content %}\n\n\nMy page content\n\n{% endblock %}");
    res.redirect('/')
});

app.get('/', (req, res) => {
    const files = fs.readdirSync('./templates');
    const links = [];
    files.forEach(file => {
        if(file.endsWith('.liquid')) {
            links.push({name:file.substring(0, file.length - 7)});
        }
    })
    res.render('hi-there',{
        links:links
    })
})
app.get('/:template', async (req, res) => {
    const dataFiles = fs.readdirSync('./data');
    const data = {};
    for(let i = 0; i < dataFiles.length; i++){
        const file = dataFiles[i];
        if(file.endsWith('.json')) {
            data[file.substring(0,file.length - 5)] = JSON.parse(fs.readFileSync('./data/' + file, 'utf8'));
        } else if(file.endsWith('.js')) {
            const url = require('./data/' + file);
            data[file.substring(0,file.length - 3)] = (await axios.get(url)).data;
        }
    }

    res.render(req.params.template, data)
})

app.listen(port, () => {
    console.log(`Vorschau auf http://localhost:${port}`);
})