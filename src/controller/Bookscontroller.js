const BookModel = require("../Models/BooksModel")
const userModel = require("../Models/usermodel")
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')
const moment=require("moment")

//.............................................POST/books........................................................


const createBook = async (req, res) => {
  try {

    //STRING VALIDATION BY REJEX
    const validatefeild= (shivam) => {
     return String(shivam).trim().match(
         /^[a-zA-Z]/);
    };

  //ISBN VALIDATION BY REJEX
    const isValidISBN=(ISBN)=>{
      return String(ISBN).trim().match(/^\+?([1-9]{3})\)?[-. ]?([0-9]{10})$/) }


    const data = req.body;
    let token = req.headers["x-api-key"] || req.headers["x-Api-Key"];
    const a=new Date()

    if (Object.keys(data).length == 0) {
      return res.status(400).send({status:false, msg: "Feild Can't Empty.Please Enter Some Details" });
    }
    const obj = {

        releasedAt:[ a.getFullYear(),a.getMonth()+1,a.getDate()].join('-')
    }
       const title = data.title;
       const excerpt = data.excerpt;
       const userId = data.userId.trim();
       const ISBN = data.ISBN;
       const category = data.category;
       const subcategory = data.subcategory;
       const reviews = data.reviews;
       const isDeleted = data.isDeleted;


     if (!title){
     return res.status(400).send({ status:false,msg:"Title is missing"});
    }
    obj.title=title


    //Title validation by Rejex
    if (!validatefeild( obj.title)) {
      return res.status(400).send({status: false,msg: "Title must contain Alphabet or Number",});
    }

    const findtitle = await BookModel.findOne({ title:title }); //title exist or not


     if(findtitle){
    return res.status(404).send({ status:false,message:`${title} Already Exist.Please,Give Another Title`})
    }

    if (!excerpt){
      return res.status(400).send({ status:false,msg:"excerpt is missing"});
     }
     obj.excerpt=excerpt



     //Name validation by Rejex
     if (!validatefeild(obj.excerpt)) {
       return res.status(400).send({status: false,msg: "excerpt must contain Alphabet or Number",});
     }

     if (!userId)
     return res.status(400).send({status:false, msg: "userId not given" })
     obj.userId=userId

     let isValiduserId = mongoose.Types.ObjectId.isValid(userId);  //return true or false


     if (!isValiduserId) {
         return res.status(400).send({ status: false, msg: "userId is Not Valid" });
     }

     const finduserId = await userModel.findById(userId) //give whole data

     if (!finduserId){
         return res.status(404).send({status: false,msg: "userId not found" })
     }
     if (!ISBN)
     return res.status(400).send({status:false, msg: "ISBN not given" })
     obj.ISBN=ISBN


     if (!isValidISBN(ISBN)) {
      return res.status(400).send({status: false,msg: "INVALID ISBN",});
    }
    const findISBN=await BookModel.findOne({ISBN:ISBN})  //gives whole data


    if(findISBN){
      return res.status(400).send({status:false, msg: `${ISBN} Already Exist.Please,Give Another ISBN` })

    }

    if (!category){
     return res.status(400).send({status:false, msg: "category not given" })
     }

     obj.category=category

     if (!validatefeild(category)) {
        return res.status(400).send({status: false,msg: "category must contain Alphabet or Number",});
      }

      if (!subcategory){
        return res.status(400).send({status:false, msg: "subcategory not given" })
        }
        obj.subcategory=subcategory
        if (!validatefeild(subcategory)) {
           return res.status(400).send({status: false,msg: "subcategory must contain Alphabet or Number",});
         }

         if(reviews){
            obj.reviews=reviews
         }
        if (typeof(reviews)!="number"){
        return res.status(400).send({status:false,message:"Invalid reviews Format"});
    }

    if (isDeleted){
        obj.isDeleted=isDeleted
        if(typeof(isDeleted)!="boolean"){
            return res.status(400).send({status: false, message: "Invalid Input of isDeleted.It must be true or false "});
        }
        if(isDeleted==true){
        return res.status(400).send({status:false,message:"isDeleted must be false while creating book"});
        }
    }
    let decodedtoken = jwt.verify(token, "group51");
    if (decodedtoken.UserId!=obj.userId)  {
        return res.status(401).send({ status: false, msg: "You are Not Authorized To create This Blog With This userId" });
      }

  const Books = await BookModel.create(obj);
      return res.status(201).send({status:true,msg: Books });

  }
    catch (err) {
      res.status(500).send({ status:false,error: err.message });
    }
  };





//...................................................GET/books..........................................................


const getbooks= async function (req, res) {  //get books using filter query params
  try {
      const userId = req.query.userId;
      const category = req.query.category;
      const subcategory = req.query.subcategory;
      const obj = {
             isDeleted: false,

      };
      if (userId)
          obj.userId = userId;
      if (category)
          obj.category = category;
      if (subcategory)
          obj.subcategory = subcategory;

      if (obj.userId) {
          let isValiduserId = mongoose.Types.ObjectId.isValid(obj.userId);//check if objectId is valid objectid
          if (!isValiduserId) {
              return res.status(400).send({ status: false, msg: "userId is Not Valid" });
          }

          const finduserId = await userModel.findById(obj.userId)//check id exist in userModel
          if (!finduserId)
              return res.status(404).send({ status:false,msg: "userId dont exist" })
      }

      const bookdata= await BookModel.find(obj).sort({title:1}).select({_id:1,title:1,excerpt:1,userId:1,category:1,reviews:1,releasedAt:1})
      if (bookdata.length == 0) {
          return res.status(404).send({ status: false, msg: "Books not found" });
      }
     res.status(200).send({ status: true,message:"Books list", data: bookdata });
  } catch (err) {
      res.status(500).send({ status: false, msg: err.message });
  }};


//...................................................GET/books/:bookId..........................................................

const getbooksbyId = async (req, res) => {
  try {
        const id=req.params.bookId
        if(!id){
          return res.status(404).send({ status:true,msg:"bookId not given"})
      }
      let isValidbookId = mongoose.Types.ObjectId.isValid(id);//check if objectId is valid objectid
          if (!isValidbookId) {
              return res.status(400).send({ status: false, msg: "BookId is Not Valid" });
          }
      const findbookid = await BookModel.findById(id)
      if(!findbookid){
        return res.status(400).send({ status: false, msg: "Incorrect BookId" });
      }

      if (findbookid.isDeleted == false) {
        const userdata=await userModel.find(findbookid.userId)


      const bookdetails=JSON.parse(JSON.stringify(findbookid))
      bookdetails.reviewsData=userdata

     res.status(200).send({status:true,message:"Books list",data: bookdetails})
      }
      res.status(404).send({status:false,message:"Books Not Found"})
}

  catch (err) {
      res.status(500).send({status:false, error: err.message })
  }}



module.exports.createBook=createBook
module.exports.getbooks=getbooks
module.exports.getbooksbyId=getbooksbyId