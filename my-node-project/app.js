const express = require('express');
const fs = require('fs/promises');

const app = express();
const port = 3000;

const dbPath = 'users.json';


app.use(express.json());


async function readData() {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}


async function writeData(data) {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}


function validateUser(user) {
    return user.name.length > 3 && user.age >= 0;
}


app.post('/users', async (req, res) => {
    const newUser = req.body;

    if (validateUser(newUser)) {
        const data = await readData();
        data.push(newUser);
        await writeData(data);
        res.json(newUser);
    } else {
        res.status(400).json({ error: 'Неправильні дані користувача' });
    }
});


app.get('/users', async (req, res) => {
    const data = await readData();
    res.json(data);
});


app.get('/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const data = await readData();
    const user = data.find(u => u.id === userId);

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'Користувача не знайдено' });
    }
});


app.put('/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const updatedUser = req.body;
    const data = await readData();

    const index = data.findIndex(u => u.id === userId);

    if (index !== -1 && validateUser(updatedUser)) {
        data[index] = { ...data[index], ...updatedUser };
        await writeData(data);
        res.json(data[index]);
    } else {
        res.status(404).json({ error: 'Користувача не знайдено або неправильні дані користувача' });
    }
});


app.delete('/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const data = await readData();

    const filteredData = data.filter(u => u.id !== userId);

    if (filteredData.length < data.length) {
        await writeData(filteredData);
        res.json({ message: 'Користувач видалений' });
    } else {
        res.status(404).json({ error: 'Користувача не знайдено' });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущено на порту ${port}`);
});