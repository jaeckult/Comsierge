const express = require('express');
const app = express();
const cors = require('cors');
const userRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const signupRouter = require('./controllers/signup');
// const conversationsRouter = require('./controllers/conversations')
// const contactRouter = require('./controllers/contact');
const { getTokenFrom } = require('./utils/middleware');


app.use(express.json());
app.use(cors())
app.use(getTokenFrom);

app.use('/api/users', userRouter);
app.use('/api/login', loginRouter);
app.use('/api/signup', signupRouter);
// app.use('/api/conversations', conversationsRouter);
// app.use('/api/contacts', contactRouter);
// app.use('/api/messages', require('./controllers/message'));
// app.use('/api/messageStatus', require('./controllers/messageStatus'));
// app.use('/api/smsWebhook', require('./controllers/smsWebhook'));

app.get('/', (req, res)=>{
    res.send('<h1>Welcome to the API</h1>')
});

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:3000`);    
});