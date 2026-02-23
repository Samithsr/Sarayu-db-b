const mongoose = require('mongoose');
const Manager = require('./models/manager-Model');

mongoose.connect('mongodb://localhost:27017/sarayu-db')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // List all managers to see what IDs exist
    const allManagers = await Manager.find({}, { _id: 1, name: 1, email: 1 });
    console.log('All managers in database:');
    allManagers.forEach(m => {
      console.log(`ID: ${m._id}, Name: ${m.name}, Email: ${m.email}`);
    });
    
    // Try to find the specific manager
    const manager = await Manager.findById('699665d3167da96651111a8');
    console.log('\nLooking for manager with ID 699665d3167da96651111a8:');
    console.log('Manager found:', manager ? 'YES' : 'NO');
    
    if (manager) {
      console.log('Manager details:', {
        _id: manager._id,
        name: manager.name,
        email: manager.email
      });
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
