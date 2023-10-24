const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://muraleedhargopi:Pf7GycJkstM0uzbv@cluster0.ljdpw6c.mongodb.net/stock', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Create a mongoose schema and model for Product Category and Technical Name
const ProductCategorySchema = new mongoose.Schema({
  name: String
});
const TechnicalNameSchema = new mongoose.Schema({
  name: String
});

const ProductCategory = mongoose.model('ProductCategory', ProductCategorySchema);
const TechnicalName = mongoose.model('TechnicalName', TechnicalNameSchema);

const TradeNameSchema = new mongoose.Schema({
  name: String
});
const PackQuantitySchema = new mongoose.Schema({
  quantity: Number,
  unit: String
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});

const TradeName = mongoose.model('TradeName', TradeNameSchema);
const PackQuantity = mongoose.model('PackQuantity', PackQuantitySchema);
const Admin = mongoose.model('admin',adminSchema);

const FirmSchema = new mongoose.Schema({
  name: String,
  addressLine1: String,
  addressLine2: String,
  mobileNumber: String,
  city: String,
  pincode: String
});
const BrandSchema = new mongoose.Schema({
  name: String
});

const Firm = mongoose.model('Firm', FirmSchema);
const Brand = mongoose.model('Brand', BrandSchema);

const ProductSchema = new mongoose.Schema({
  productCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' },
  technicalName: { type: mongoose.Schema.Types.ObjectId, ref: 'TechnicalName' },
  tradeName: { type: mongoose.Schema.Types.ObjectId, ref: 'TradeName' },
  brandName: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  packQuantity: { type: mongoose.Schema.Types.ObjectId, ref: 'PackQuantity' },
  firm: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm' },
  invoiceCost: Number
});

const Product = mongoose.model('Product', ProductSchema);


// Middleware
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',async(req,res)=>{
  res.send("Server is up and running....")
})


// Routes
app.post('/addProductCategory', async (req, res) => {
  const productCategory = new ProductCategory({ name: req.body.name });
  await productCategory.save();
  res.redirect('home');
});

app.post('/addTechnicalName', async (req, res) => {
  const technicalName = new TechnicalName({ name: req.body.name });
  await technicalName.save();
  res.redirect('home');
});

// app.post('/addTradeName', async (req, res) => {
//   const tradeName = new TradeName({ name: req.body.name });
//   await tradeName.save();
//   res.send('Trade Name added!');
// });

app.post('/addTradeName', async (req, res) => {
  const tradeName = new TradeName({ name: req.body.name });
  await tradeName.save();
  res.redirect(`/home?username=${req.query.username}`);
});


app.post('/addPackQuantity', async (req, res) => {
  const packQuantity = new PackQuantity({ 
    quantity: req.body.quantity, 
    unit: req.body.unit 
  });
  await packQuantity.save();
  res.redirect('home');
});

app.post('/addFirm', async (req, res) => {
  const firm = new Firm({
    name: req.body.name,
    addressLine1: req.body.addressLine1,
    addressLine2: req.body.addressLine2,
    mobileNumber: req.body.mobileNumber,
    city: req.body.city,
    pincode: req.body.pincode
  });
  await firm.save();
  res.redirect('home');
});

adminSchema.methods.changePassword = function(oldPassword, newPassword) {
  // Check if oldPassword matches the current password
  if (oldPassword !== this.password) {
      throw new Error('Old password does not match.');
  }

  // Set the new password
  this.password = newPassword;

  // Save the updated admin document
  return this.save();
};


app.post('/addBrand', async (req, res) => {
  const brand = new Brand({ name: req.body.name });
  await brand.save();
  res.redirect('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});


app.post('/login', async (req, res) => {
  try {
      const user = await Admin.findOne({ username: req.body.username });
      
      if (user && user.password === req.body.password) { 
        res.render('home', { username: user.username });
      } else {
          res.send('Incorrect username or password.');
      }
  } catch (error) {
      res.send('An error occurred.');
  }
});


app.get('/logout', (req, res) => {
  res.redirect('/login');
});

app.get('/addProductCategoryPage', (req, res) => {
  res.render('addProductCategory');
});

app.get('/home',(req,res)=>{
    const username = req.query.username || "Admin"; 
    res.render('home', { username: username });
})

app.get('/addTechnicalNamePage', (req, res) => {
  const username = req.query.username;
  res.render('addTechnicalName', { username: username });
});

app.get('/addTradeNamePage', (req, res) => {
  const username = req.query.username;
  res.render('addTradeName', { username: username });
});

app.get('/addPackQuantityPage', (req, res) => {
  const username = req.query.username;
  res.render('addPackQuantity', { username });
});

app.get('/addFirmPage', (req, res) => {
  const username = req.query.username;
  res.render('addFirm', { username });
});

app.get('/addBrandPage', (req, res) => {
  const username = req.query.username;
  res.render('addBrand', { username });
});

app.get('/change-password', (req, res) => {
  res.render('change-password');
});

app.post('/change-password', async (req, res) => {
  try {
      const { username, oldPassword, newPassword } = req.body;
      const admin = await Admin.findOne({ username: username });

      if(!admin) {
          return res.status(400).send('Username not found');
      }

      //await admin.changePassword(oldPassword, newPassword);

      if (oldPassword !== admin.password) {
        throw new Error('Old password does not match.');
      }
      admin.password = newPassword;
      admin.save();
      res.render('home',{username});
  } catch (error) {
      res.status(400).send(error.message);
  }
});

app.get('/addProductPage', async (req, res) => {
  const username = req.query.username;

  
  const productCategories = await ProductCategory.find();
  const technicalNames = await TechnicalName.find();
  const tradeNames = await TradeName.find();
  const brandNames = await Brand.find();
  const packQuantities = await PackQuantity.find();
  const firms = await Firm.find();
  res.render('addProduct', {
      username,
      productCategories,
      technicalNames,
      tradeNames,
      brandNames,
      packQuantities,
      firms
  });
});


app.post('/addProduct', async (req, res) => {
  try {
    const product = new Product({
      productCategory: req.body.productCategory,
      technicalName: req.body.technicalName,
      tradeName: req.body.tradeName,
      brandName: req.body.brandName,
      packQuantity: req.body.packQuantity,
      firm: req.body.firm,
      invoiceCost: req.body.invoiceCost
    });
    let username = ''
    await product.save();
    res.render('home',{username});
  } catch (error) {
    res.status(500).send('An error occurred while adding the product.');
  }
});

// app.get('/displayProducts', async (req, res) => {
//   const username = req.query.username;

//   try {
//       const products = await Product.find()
//           .populate('productCategory')
//           .populate('technicalName')
//           .populate('tradeName')
//           .populate('brandName')
//           .populate('packQuantity')
//           .populate('firm');

//       res.render('displayProducts', { username, products });
//   } catch (error) {
//       res.status(500).send('An error occurred while fetching products.');
//   }
// });

app.get('/displayProducts', async (req, res) => {
  const username = req.query.username;
  try {
    const products = await Product.find()
      .populate('productCategory')
      .populate('technicalName')
      .populate('tradeName')
      .populate('brandName')
      .populate('packQuantity')
      .populate({
        path: 'firm',
        model: 'Firm'
      });

      console.log(products)

      
        const product = await Product.findById(req.params.id).populate('productCategory technicalName tradeName brandName packQuantity firm');
      
        const productCategories = await ProductCategory.find();
        const technicalNames = await TechnicalName.find();
        const tradeNames = await TradeName.find();
        const brandNames = await Brand.find();
        const packQuantities = await PackQuantity.find();
        const firms = await Firm.find();
  
        // res.render('editProduct', {
        //     product,
        //     productCategories,
        //     technicalNames,
        //     tradeNames,
        //     brandNames,
        //     packQuantities,
        //     firms
        // });


        res.render('display2', { username, products , productCategories,
          technicalNames,
          tradeNames,
          brandNames,
          packQuantities,
          firms});

    
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal server error");
  }
});

app.get('/searchProducts', async (req, res) => {
  try {
    const queryObj = {};

      if (req.query.productCategory) {
          queryObj.productCategory = req.query.productCategory;
      }
      if (req.query.technicalName) {
          queryObj.technicalName = req.query.technicalName;
      }
      if (req.query.tradeName) {
          queryObj.tradeName = req.query.tradeName;
      }
      if (req.query.brandName) {
          queryObj.brandName = req.query.brandName;
      }
      if (req.query.packQuantity) {
          queryObj.packQuantity = req.query.packQuantity;
      }
      if (req.query.firm) {
          queryObj.firm = req.query.firm;
      }

      const products = await Product.find(queryObj)
      .populate('productCategory')
      .populate('technicalName')
      .populate('tradeName')
      .populate('brandName')
      .populate('packQuantity')
      .populate('firm');


      const product = await Product.findById(req.params.id).populate('productCategory technicalName tradeName brandName packQuantity firm');
      
        const productCategories = await ProductCategory.find();
        const technicalNames = await TechnicalName.find();
        const tradeNames = await TradeName.find();
        const brandNames = await Brand.find();
        const packQuantities = await PackQuantity.find();
        const firms = await Firm.find();
      
      console.log(products);
      res.render('display2', { products , productCategories,
        technicalNames,
        tradeNames,
        brandNames,
        packQuantities,
        firms });  // change this as per your requirement (e.g., rendering, sending JSON, etc.)

  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).send('Internal Server Error');
  }
});

// app.get('/searchProducts', async (req, res) => {
//   try {
//       const query = {};

//       if (req.query.search) {
//           const searchRegex = new RegExp(req.query.search, 'i'); 

//           // Build the query object dynamically
//           query['tradeName.name'] = { $regex: searchRegex };
//           query['technicalName.name'] = { $regex: searchRegex };
//           query['brandName.name'] = { $regex: searchRegex };
//           query['productCategory.name'] = { $regex: searchRegex };
//           query['packQuantity.quantity'] = { $regex: searchRegex };  
//           query['firm.name'] = { $regex: searchRegex };

//           // Using $or with the dynamically built query object
//           query.$or = [
//               { 'tradeName.name': { $regex: searchRegex } },
//               { 'technicalName.name': { $regex: searchRegex } },
//               { 'brandName.name': { $regex: searchRegex } },
//               { 'productCategory.name': { $regex: searchRegex } },
//               { 'packQuantity.quantity': { $regex: searchRegex } },
//               { 'firm.name': { $regex: searchRegex } },
//           ];
//       }

//       const products = await Product.find(query).populate('productCategory technicalName tradeName brandName packQuantity firm');
//       console.log(products);
//       res.render('displayProducts', { products });

//   } catch (error) {
//       console.error('Error fetching products:', error);
//       res.status(500).send('Internal Server Error');
//   }
// });

// app.get('/searchProducts', async (req, res) => {
//   try {
//       const query = {};

//       if (req.query.search) {
//           const searchRegex = new RegExp(req.query.search, 'i'); 
//           console.log(req.query.search);
//           query.$or = [
//               { 'tradeName.name': { $regex: searchRegex } },
//               { 'technicalName.name': { $regex: searchRegex } },
//               { 'brandName.name': { $regex: searchRegex } },
//               { 'productCategory.name': { $regex: searchRegex } },
//               { 'packQuantity.quantity': { $regex: searchRegex } },  
//               { 'firm.name': { $regex: searchRegex } },
//           ];
//       }

//       const searchTermrrr = "Bayer";
// const searchRegexrrr = new RegExp(searchTermrrr, 'i');
// console.log("Testing Regex:", searchRegexrrr.test("Bayer"));

//       const products = await Product.find(query).populate('productCategory technicalName tradeName brandName packQuantity firm');
      
//       console.log("Number of products found:", products.length);
      
//       res.render('displayProducts', { products });
//   } catch (error) {
//       console.error('Error fetching products:', error);
//       res.status(500).send('Internal Server Error');
//   }
// });




app.get('/editProduct/:id', async (req, res) => {
  try {
      const product = await Product.findById(req.params.id).populate('productCategory technicalName tradeName brandName packQuantity firm');
    
      const productCategories = await ProductCategory.find();
      const technicalNames = await TechnicalName.find();
      const tradeNames = await TradeName.find();
      const brandNames = await Brand.find();
      const packQuantities = await PackQuantity.find();
      const firms = await Firm.find();

      res.render('editProduct', {
          product,
          productCategories,
          technicalNames,
          tradeNames,
          brandNames,
          packQuantities,
          firms
      });
  } catch (error) {
      console.error('Error fetching product or related data:', error);
      res.status(500).send('Internal Server Error');
  }
});


app.post('/editProduct/:id', async (req, res) => {
  try {
      await Product.findByIdAndUpdate(req.params.id, req.body);
      res.redirect('/displayProducts');
  } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).send("Internal server error");
  }
});


app.get('/deleteProduct/:id', async (req, res) => {
  try {
      await Product.findByIdAndDelete(req.params.id);
      res.redirect('/displayProducts');
  } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).send("Internal server error");
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
