const mongoose = require('mongoose');

// Your MongoDB connection string
mongoose.connect('mongodb+srv://muraleedhargopi:Pf7GycJkstM0uzbv@cluster0.ljdpw6c.mongodb.net/stock', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});

const Admin = mongoose.model('admin', adminSchema);

const newAdmin = new Admin({
  username: 'murali',
  password: 'murali321#'
});

newAdmin.save()
  .then(() => {
    console.log('Admin details saved successfully!');
    mongoose.connection.close();  // Close the connection after saving
  })
  .catch(error => {
    console.error('Error saving admin details:', error);
  });
