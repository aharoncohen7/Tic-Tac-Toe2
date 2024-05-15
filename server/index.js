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
    // יצירת חדר
    socket.on('create-room', (creator) => {
        const roomNumber = Math.floor(Math.random() * 900000) + 100000;
        while (waitingRooms[roomNumber] || playRooms[roomNumber]) {
            roomNumber = Math.floor(Math.random() * 900000) + 100000;
        }
        // יצירת חלל משותף וצירוף שחקן ראשון
        socket.join(roomNumber)
        // עדכון פרטי שחקן
        const player1 = {
            ...creator,
            status: "creator",
            // roomNum: roomNumber,
            id: socket.id,
            symbol: null,
            victories: 0,
            gameSum: 0
        }
        // הכנסת שחקן ראשון לחדר המתנה
        waitingRooms[roomNumber] = { players: [player1] }
        playerList[socket.id] = { roomNumber, status: player1.status };
        console.log(waitingRooms);
        // הודעה על פתיחת חדר
        socket.emit('the-room-is-created', player1, roomNumber);
    })

    // כשמישהו מבקש להצטרף
    socket.on('join-room', (joiner, roomNumber) => {
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

            // הכנסת השני לחדר המתנה
            waitingRooms[roomNumber].players.push(player2);
            playerList[socket.id] = { roomNumber, status: player2.status };

            // יצירת חדר משחק
            playRooms[roomNumber] = {
                currentPlayer: waitingRooms[roomNumber].players[0],
                nextPlayer: waitingRooms[roomNumber].players[1],
            }
            // הודעה לשחקן יוצר על  ההצטרפות והשלמת הצמד
            io.to(playRooms[roomNumber].currentPlayer.id).emit('match');
            // הודעה לשחקן מצטרף על אישור בקשת ההצטרפות
            io.to(playRooms[roomNumber].nextPlayer.id).emit('welcome', player2)
        }
        // במקרה שלא נמצא חדר או שהוא מלא
        else { socket.emit('error-message'), "room not found" }
        // console.log(waitingRooms);
    })

    // כשהיוצר בחר סמל משחק
    socket.on('choose-symbol', (symbol1) => {
        // io.emit('set-player' , player)
        const symbol2 = (symbol1 == 'X') ? 'O' : 'X';
        const roomNumber = playerList[socket.id].roomNumber;
        const room = playRooms[roomNumber];
        room.currentPlayer.symbol = symbol1;
        room.nextPlayer.symbol = symbol2;
        // console.log(playRooms);
        // החלת בחירה עבור יוצר
        io.to(room.currentPlayer.id).emit('set-player', room.currentPlayer);
        // החלת בחירה הפוכה ליריב
        io.to(room.nextPlayer.id).emit('set-player', room.nextPlayer);
    })

    //  בעת לחיצה על לחצן מעבר ללוח משחק
    socket.on('go-to-board', () => {
        io.emit('navigate-to-play-board')
    })

    // תחילת משחק לאחר בחירת גודל לוח
    socket.on('set-size', (boardSize) => {
        const roomNumber = playerList[socket.id].roomNumber;
        const room = playRooms[roomNumber];
        if (socket.id !== room.currentPlayer.id) {
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
        // room.currentPlayer = { id: room.creator.id, symbol: room.creator.symbol };
        // room.nextPlayer = { id: room.joiner.id, symbol: room.joiner.symbol };
        room.currentPlayer.gameSum++;
        room.nextPlayer.gameSum++;
        room.steps = 0;
        room.size = boardSize;
        // room.winner = null;
        // room.IsGameOver = false;
        console.log(room);
        // const firstPlayer = playRooms[roomNumber].currentPlayer.symbol;
        const firstPlayer = room.currentPlayer;
        io.to(room.currentPlayer.id).emit('update-user', room.currentPlayer)
        io.to(room.nextPlayer.id).emit('update-user', room.nextPlayer)
        // שידור ליריבים על תחילת משחק
        io.emit('get-board-size', boardSize, firstPlayer.symbol)
    })


    // צעד במשחק
    socket.on('move', (i) => {
        const roomNumber = playerList[socket.id].roomNumber;
        const room = playRooms[roomNumber];
        const boardSize = room.size;

        // בדיקה שאכן התור שלך לפי נתוני השרת
        if (socket.id !== room.currentPlayer.id) {
            console.log('not your turn');
            io.to(socket.id).emit('error-message', 'not your turn')
            return;
        }
        // בדיקה שהמשבצת שנבחרה אכן ריקה
        if (room.boardGame[i] !== null) {
            console.log("the square is already full!");
            io.to(socket.id).emit('error-message', 'the square is already full')
            return;
        }
        // עדכון הלוח
        room.boardGame[i] = room.currentPlayer.symbol;
        // עדכון הטבלה
        room.boardState = updateGame(i, room.size, room.currentPlayer.symbol, room.boardState)
        room.steps++;
        // שידור לוח המשחק וצורת השחקן הבא חזרה לשני היריבים
        io.emit('change-turn', room.nextPlayer.symbol, room.boardGame);
        // בדיקת הלוח לאחר הפעולה
        // בדיקה שבכלל נצחון אפשרי
        if (room.steps > boardSize * 2 - 2) {
            // בדיקת נצחון
            const isLineFounded = checkBoard(room.boardGame, i, boardSize)
            if (isLineFounded) {
                room.currentPlayer.victories++;
                io.emit('game-over-with-winner', room.currentPlayer.symbol);
                io.to(room.currentPlayer.id).emit('update-user', room.currentPlayer)
                io.to(room.nextPlayer.id).emit('update-user', room.nextPlayer)
                if (room.currentPlayer.status === "joiner") {
                    swap(roomNumber)
                }
                return;
            }
        }
        // אם אין נצחון
        // בדיקה אם המשחק נגמר בלי מנצח
        if (room.steps == boardSize * boardSize
            // ||playRooms[roomNumber].boardGame.every((square) => square!== null) 
            || checkGameOver(room.boardState)) {
            room.steps = 0;
            io.emit('game-over-without-winner',);
            io.to(room.currentPlayer.id).emit('update-user', room.currentPlayer)
            io.to(room.nextPlayer.id).emit('update-user', room.nextPlayer)
            if (room.currentPlayer.status === "joiner") {
                swap(roomNumber)
            }
            return;
        }

        swap(roomNumber)
    });

    // בלחיצה על ההודעה 
    socket.on('restart-game', () => {
        if (playerList[socket.id].status == "creator") {
            io.emit("restart-game")
        }
    })

    socket.on('quit', () => {
        const roomNumber = playerList[socket.id].roomNumber;
        const room = playRooms[roomNumber];
        if (room.steps > 1) {
            if (socket.id == room.currentPlayer.id) {
                room.nextPlayer.victories++;
                io.to(room.nextPlayer.id).emit('update-user', room.nextPlayer)
            }
            else if (socket.id == room.nextPlayer.id) {
                room.currentPlayer.victories++;
                io.to(room.currentPlayer.id).emit('update-user', room.currentPlayer)
            }
        }

    })


    console.log("connected", socket.id);
})


const swap = (roomNumber) => {
    const room = playRooms[roomNumber];
    const prevPlayer = { ...room.currentPlayer };
    const currentPlayer = { ...room.nextPlayer };
    room.currentPlayer = currentPlayer;
    room.nextPlayer = prevPlayer;

}


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