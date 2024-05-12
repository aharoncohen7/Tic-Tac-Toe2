const { log } = require('console');

const express = require('express'),
    app = express(),
    { createServer } = require('http'),
    { Server } = require('socket.io'),
    cross = require('cors');
app.use(cross());

const server = createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: '* ' } })

const playRooms = {}
const waitingRooms = {}
const playerList = {}

io.on('connection', (socket) => {
    socket.on('create-room', (player1) => {
        const roomNumber = Math.floor(Math.random() * 900000) + 100000
        while (waitingRooms[roomNumber] || playRooms[roomNumber]) {
            roomNumber = Math.floor(Math.random() * 900000) + 100000
        }
        // יצירת חדר וצירוף שחקן ראשון
        socket.join(roomNumber)
        const creator = {
            ...player1,
            status: "creator",
            roomNum: roomNumber,
            id: socket.id
        }
        console.log("🚀 ~ socket.on ~ player:", creator)
        // הכנסת שחקן ראשון לחדר המתנה
        waitingRooms[roomNumber] = { players: [creator] }
        playerList[socket.id] = roomNumber;
        console.log(waitingRooms);
        // הודעה על פתיחת חדר
        socket.emit('create-room', creator);
    })

    // כשמישהו מבקש להצטרף
    socket.on('join-room', (player2) => {
        // console.log(waitingRooms[roomNumber]?.players?.length);
        const roomNumber = player2.roomNum;
        // אם קיים חדר כזה ויש בו רק שחקן אחד
        if (waitingRooms[roomNumber] && waitingRooms[roomNumber]?.players?.length == 1) {
            // צירוף שחקן שני
            socket.join(roomNumber)
            const joiner = {
                ...player2,
                status: "joiner",
                id: socket.id
            }
            console.log("🚀 ~ socket.on ~ player:", joiner)
            // הכנסת השני לחדר המתנה
            waitingRooms[roomNumber].players.push(joiner);
            playerList[socket.id] = roomNumber;
            // הודעה לשחקן מצטרף על אישור בקשת ההצטרפות
            socket.emit('join-room', joiner);
            // הודעה לשחקן יוצר על  ההצטרפות והשלמת הצמד
            io.to(waitingRooms[roomNumber].players[0].id).emit('join-room', roomNumber);
            

            playRooms[roomNumber] = {
                creator: waitingRooms[roomNumber].players[0],
                joiner: waitingRooms[roomNumber].players[1]
            }


            console.log(playRooms);
        }
        // במקרה שלא נמצא חדר או שהוא מלא
        else { socket.emit('join-room'), false }
        // console.log(waitingRooms);
    })


    // כשהיוצר בחר סמל משחק
    socket.on('choose-player', (symbol, roomNum) => {
        // io.emit('set-player' , player)
        playRooms[roomNum].creator.play = symbol; 
        playRooms[roomNum].joiner.play = symbol == 'X' ? 'O' : 'X'; 
        console.log(playRooms);
        // החלת בחירה עבור יוצר
        io.to(playRooms[roomNum]?.creator.id).emit('set-player',symbol);
        // החלת בחירה הפוכה ליריב
        io.to(playRooms[roomNum]?.joiner.id).emit('set-player', symbol == 'X' ? 'O' : 'X');
    })


    //   מעבר למשחק לאחר בחירת סמלים
    socket.on('lets-play', () => {
        io.emit('navigate-to-play-board')
    })


    // תחילת משחק לאחר בחירת גודל לוח
    socket.on('start-game', (boardSize) => {
        playRooms[playerList[socket.id]].boardGame = Array(boardSize * boardSize).fill(null);
        console.log(playerList[socket.id]);
        console.log(playRooms[playerList[socket.id]].boardGame);
        // שידור ליריבים על תחילת משחק
        io.emit('get-board', boardSize)
    })



    socket.on('move', (i) => {
        console.log(i);
        
        let currentPlayer = '';
        // בדיקה אם השחקן הוא היוצר של החדר
        if (playRooms[playerList[socket.id]].creator.id === socket.id) {
            playRooms[playerList[socket.id]].boardGame[i] = playRooms[playerList[socket.id]].creator.play;
            // בדיקה אם היוצר שיחק כבר, אם כן נשנה את תור המשחק
            currentPlayer = playRooms[playerList[socket.id]].creator.play == 'X' ? 'O' : 'X';
        } else {
            playRooms[playerList[socket.id]].boardGame[i] = playRooms[playerList[socket.id]].joiner.play;
            // אם לא, נבדוק אם המצטרף שיחק כבר ונשנה תור
            currentPlayer = playRooms[playerList[socket.id]].joiner.play == 'X' ? 'O' : 'X';

        }
        console.log(currentPlayer);
        io.emit('change-turn', currentPlayer, playRooms[playerList[socket.id]].boardGame);
    });
    






    console.log("connected", socket.id);
})





server.listen(3000, () => console.log('@@@@@@@ server is listening on port 3000 @@@@@@'))