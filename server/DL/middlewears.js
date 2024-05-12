const fs = require('fs');

const readData = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));

const readOneGame = (path,id) => JSON.parse(fs.readFileSync(path, 'utf8'))[id];

const writeData = (path, data) => {
    fs.writeFileSync(path, JSON.stringify(data));
    return readData(path);
};

const updateData = (path, id, field, newData) => {
    let data = readData(path);
    field === 'players' ?
        data[id][field][1]['name'] = newData : data[id][field] = newData;
    return writeData(path, data)[id][field];
}

const createGame = ({file_name, room_id, name='Joshua', symbol='X', size=3}) => {
    const secondSymbol = symbol==='X'? 'O': 'X';
    const newGame = {
        "players": [
            { "name": name, "symbol": symbol },
            { "name": "Player 2", "symbol": secondSymbol }
        ],
        "board": Array(size * size).fill(null),
        "step": 0
    };
    let data = readData(file_name);
    data[room_id] = newGame;
    return writeData(file_name, data)[room_id];

}



module.exports = { readOneGame, writeData, updateData, createGame };

