// Импорт Express.js const express = require ( 'express' );


// Создать приложение Express const app = express ();


// Промежуточное ПО для разбора тел JSON 
app.use ( express.json ( ) ) ;

// Установить порт и verify_token const port = process . env . PORT || 3000 ; const verifyToken = process . env . VERIFY_TOKEN ;
 


// Маршрут для GET-запросов app.get('/', ( 
req , res ) = > { const { ' hub.mode ' : mode , ' hub.challenge ' : challenge , ' hub.verify_token ' : token } = req.query ;   
       

  если ( mode === 'subscribe' && token === verifyToken ) { 
    console.log ( ' WEBHOOK ПРОВЕРЕН' ) ; 
    res.status ( 200 ) .send ( challenge ) ; } else { 
    res.status ( 403 ) .end ( ); } } ) ;    


// Маршрут для POST-запросов app.post 
( ' /' , ( req , res ) = > { const timestamp = new Date ( ). toISOString (). replace ( 'T' , ' ' ). slice ( 0,19 ) ; 
  console.log (` \ n\n Webhook получен $ { timestamp } \ n ` ); console.log 
  ( JSON.stringify ( req.body , null , 2 ) ) ; res.status 
  ( 200 ) .end ( ) ; }) ;   
        


// Запустить серверное 
приложение . listen ( port , () => { 
  console . log (` \n Прослушивание порта $ { port } \n `); });   
