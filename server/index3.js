const { log } = require('console');
const express = require('express'),
    app = express(),
    { createServer } = require('http'),
    { Server } = require('socket.io'),
    cross = require('cors');
app.use(cross());
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: '* ' } })


// פוקנציות חישובי משחק
const { updateGame, checkBoard, checkGameOver } = require('./helpers')
// חדרי המתנה
const waitingRooms = {}
// חדרי משחק
const playRooms = {}
// קישור בין שחקנים למספר החדר
const playerList = {}

io.on('connection', (socket) => {
    socket.on('create-room', (creator) => {
        const roomNumber = Math.floor(Math.random() * 900000) + 100000
        while (waitingRooms[roomNumber] || playRooms[roomNumber]) {
            roomNumber = Math.floor(Math.random() * 900000) + 100000
        }
        // יצירת חדר וצירוף שחקן ראשון
        socket.join(roomNumber)
        const player1 = {
            ...creator,
            status: "creator",
            roomNum: roomNumber,
            id: socket.id,
            symbol: null,
            victories: 0,
            gameSum: 0
        }
        console.log("🚀 ~ socket.on ~ player:", player1)
        // הכנסת שחקן ראשון לחדר המתנה
        waitingRooms[roomNumber] = { players: [player1] }
        playerList[socket.id] = roomNumber;
        console.log(waitingRooms);
        // הודעה על פתיחת חדר
        socket.emit('the-room-is-created', creator);
    })

    // כשמישהו מבקש להצטרף
    socket.on('join-room', (joiner) => {
        const roomNumber = player2?.roomNum;
        // אם קיים חדר כזה ויש בו רק שחקן אחד
        if (waitingRooms[roomNumber] && waitingRooms[roomNumber]?.players?.length == 1) {
            // צירוף שחקן שני
            socket.join(roomNumber)
            const player2 = {
                ...joiner,
                status: "joiner",
                id: socket.id,
                symbol: null,
                victories: 0,
                gameSum: 0
            }
            // console.log("🚀 ~ socket.on ~ player:", player2)
            // הכנסת השני לחדר המתנה
            waitingRooms[roomNumber].players.push(player2);
            playerList[socket.id] = roomNumber;

            // יצירת חדר משחק
            playRooms[roomNumber] = {
                creator: waitingRooms[roomNumber].players[0],
                joiner: waitingRooms[roomNumber].players[1],
                // currentPlayer: {id: this.creator.id, symbol: this.creator.symbol},
                // nextPlayer: {id: this.joiner.id, symbol: this.joiner.symbol}
            }
            // console.log(playRooms, "fffffffffffffffffffffffffffff");
            // הודעה לשחקן מצטרף על אישור בקשת ההצטרפות
            io.to(playRooms[roomNumber].joiner.id).emit('welcome', joiner)
            // socket.emit('welcome', joiner);
            // הודעה לשחקן יוצר על  ההצטרפות והשלמת הצמד
            io.to(playRooms[roomNumber].creator.id).emit('match');
        }
        // במקרה שלא נמצא חדר או שהוא מלא
        else { socket.emit('error'), "room not founded" }
        // console.log(waitingRooms);
    })


    // כשהיוצר בחר סמל משחק
    socket.on('choose-player', (symbol, roomNum) => {
        // io.emit('set-player' , player)
        playRooms[roomNum].creator.symbol = symbol;
        playRooms[roomNum].joiner.symbol = symbol == 'X' ? 'O' : 'X';
        console.log(playRooms);
        // החלת בחירה עבור יוצר
        io.to(playRooms[roomNum]?.creator.id).emit('set-player', playRooms[roomNum].creator.symbol);
        // החלת בחירה הפוכה ליריב
        io.to(playRooms[roomNum]?.joiner.id).emit('set-player', playRooms[roomNum].joiner.symbol);
    })


    //  בעת לחיצה על לחצן מעבר ללוח משחק
    socket.on('go-to-board', () => {
        io.emit('navigate-to-play-board')
    })

    // תחילת משחק לאחר בחירת גודל לוח
    socket.on('set-size', (boardSize) => {
        const room = playRooms[playerList[socket.id]];
        if (socket.id !== room.creator.id) {
            console.log("You are not allowed to choose sizeBoard");
            return;
        }
        


        room.boardGame = Array(boardSize * boardSize).fill(null);
        room.boardState = {
            rows: Array(boardSize).fill(null),
            columns: Array(boardSize).fill(null),
            mainDiagonal: null,
            secondaryDiagonal: null
        }
        room.currentPlayer = { id: room.creator.id, symbol: room.creator.symbol };
        room.nextPlayer = { id: room.joiner.id, symbol: room.joiner.symbol };
        room.creator.gameSum++;
        room.joiner.gameSum++;
        room.steps = 0;
        room.size = boardSize;
        // room.winner = null;
        // room.IsGameOver = false;
        console.log(playRooms[roomNumber]);


        // const firstPlayer = playRooms[roomNumber].currentPlayer.symbol;
        const firstPlayer = room.currentPlayer.symbol;


        // שידור ליריבים על תחילת משחק
        io.emit('get-board-size', boardSize, firstPlayer)
    })


    // צעד במשחק
    socket.on('move', (i) => {
        console.log(i, "move");
        const roomNumber = playerList[socket.id];
        const boardSize = playRooms[roomNumber].size;
        console.log(roomNumber, "boardSize", boardSize);
        // בדיקה שאכן התור שלך לפי נתוני השרת
        if (socket.id !== playRooms[roomNumber].currentPlayer.id) {
            console.log('not your turn');
            io.to(socket.id).emit('error-message', 'not your turn')
            return;
        }
        if (playRooms[roomNumber].boardGame[i] !== null) {
            console.log("the square is already full!");
            io.to(socket.id).emit('error-message', 'the square is already full')
            return;
        }
        // let currentPlayer = {};
        // let nextPlayer = {};

        // // בדיקה אם השחקן הפועל הוא היוצר של החדר
        // if (socket.id == playRooms[roomNumber].creator.id) {
        //     currentPlayer = {
        //         symbol: playRooms[roomNumber].creator.symbol,
        //         id: playRooms[roomNumber].creator.id
        //     }
        //     nextPlayer = {
        //         symbol: playRooms[roomNumber].joiner.symbol,
        //         id: playRooms[roomNumber].joiner.id
        //     };
        // }
        // else {
        //     currentPlayer = {
        //         symbol: playRooms[roomNumber].joiner.symbol,
        //         id: playRooms[roomNumber].joiner.id
        //     }
        //     nextPlayer = {
        //         symbol: playRooms[roomNumber].creator.symbol,
        //         id: playRooms[roomNumber].creator.id
        //     };
        // }
        // playRooms[roomNumber].boardGame[i] = currentPlayer.symbol;
        playRooms[roomNumber].boardGame[i] = playRooms[roomNumber].currentPlayer.symbol;
        playRooms[roomNumber].boardState = updateGame(i, playRooms[roomNumber].size, playRooms[roomNumber].currentPlayer.symbol, playRooms[roomNumber].boardState)
        playRooms[roomNumber].steps++;
        // שידור לוח המשחק וצורת השחקן הבא חזרה לשני היריבים

        io.emit('change-turn', playRooms[roomNumber].nextPlayer.symbol, playRooms[roomNumber].boardGame);

        // console.log(nextPlayer);
        // console.log(playRooms[roomNumber].steps);
        // console.log(playRooms[roomNumber].boardGame);
        // console.log(playRooms[roomNumber].boardState);

        // בדיקת הלוח לאחר הפעולה
        const isLineFounded = checkBoard(playRooms[roomNumber].boardGame, i, boardSize)
        if (isLineFounded) {
            const winner = playRooms[roomNumber].currentPlayer;
            // playRooms[roomNumber].IsGameOver = true;
            console.log(winner);
            // console.log(playRooms[roomNumber].IsGameOver);
            if (winner.id === playRooms[roomNumber].creator.id) {
                playRooms[roomNumber].creator.victories++;
            }
            else if (winner.id === playRooms[roomNumber].joiner.id) {
                playRooms[roomNumber].joiner.victories++;
            }
            io.emit('game-over-with-winner', winner);
            // io.to(playRooms[roomNumber].creator.id).emit('game-over', playRooms[roomNumber].winner);
            // io.to(playRooms[roomNumber].joiner.id).emit('game-over', playRooms[roomNumber].winner);
            return;
        }
        // אם אין נצחון
        if (playRooms[roomNumber].steps == boardSize * boardSize
            // ||playRooms[roomNumber].boardGame.every((square) => square!== null) 
            || checkGameOver(playRooms[roomNumber].boardState)) {
            // playRooms[roomNumber].IsGameOver = true;
            playRooms[roomNumber].steps = 0;
            io.emit('game-over-without-winner', 'draw');
            // io.to(playRooms[roomNumber].creator.id).emit('game-over', 'draw');
            // io.to(playRooms[roomNumber].joiner.id).emit('game-over', 'draw');
            return;
        }





        // החלפת תורות
        const nextPlayer = { ...playRooms[roomNumber].currentPlayer };
        const currentPlayer = { ...playRooms[roomNumber].nextPlayer };
        playRooms[roomNumber].currentPlayer = currentPlayer;
        playRooms[roomNumber].nextPlayer = nextPlayer;

    });


    socket.on('restart-game', () => {
        // const roomNumber = playerList[socket.id];
        const room = playRooms[playerList[socket.id]];

        io.emit("restart-game")

    })







    console.log("connected", socket.id);
})



server.listen(3000, () => console.log('@@@@@@@ server is listening on port 3000 @@@@@@'))



// יצירת לוח משחק
        // playRooms[roomNumber].boardGame = Array(boardSize * boardSize).fill(null);
        // console.log(playRooms[roomNumber].boardGame);
        // יצירת מפת משחק
        // playRooms[roomNumber].boardState = {
        //     rows: Array(boardSize).fill(null),
        //     columns: Array(boardSize).fill(null),
        //     mainDiagonal: null,
        //     secondaryDiagonal: null
        // };
        // איפוס ועדכון נתונים למשחק הבא
        // playRooms[roomNumber].currentPlayer = {id: playRooms[roomNumber].creator.id, symbol: playRooms[roomNumber].creator.symbol},
        // playRooms[roomNumber].nextPlayer= {id: playRooms[roomNumber].joiner.id, symbol: playRooms[roomNumber].joiner.symbol}
        // playRooms[roomNumber].creator.gameSum++;
        // playRooms[roomNumber].joiner.gameSum++;
        // playRooms[roomNumber].steps = 0;
        // playRooms[roomNumber].size = boardSize;
        // playRooms[roomNumber].winner = null;
        // playRooms[roomNumber].IsGameOver = false;