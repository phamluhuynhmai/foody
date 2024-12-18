import { Admin } from './../models/Admin.js'
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signup = async(req, res, next) => {
  try {
    const { name, surname, email, password } = req.body;
    // kiểm tra định dạng email
    if(validator.isEmail(email)){
      // tìm kiếm email trong MongoDB xem có tồn tại chưa
      await Admin.find({email:email})
      .then(result => {
        if(result.length >=1) {
          res.json({
            success: false,
            message: "Email đã tồn tại!"
          });
        }else {
          // băm mật khẩu
          bcrypt.hash(password, 10, (err, hash) => {
            if(err){
              res.json({
                success:false,
                message: "Lỗi, không thể mã hóa mật khẩu!",
              })
            }else {
              // lưu admin mới vào MongoDB
              let admin = new Admin({
                name:name, 
                surname:surname, 
                email:email, 
                password:hash
              })
              admin.save().then(()=> {
                res.json({
                  success: true,
                  message: "Admin đã được tạo thành công."
                });
              }).catch(err => {
                res.json({
                  success: false,
                  message: `Không thể tạo Admin này.`
                });
              })
            }
          })
        }
      })
    }else {
      res.json({                  
        success:false,
        message: "Định dạng email không hợp lệ!"
      })
    }
  } catch (error) {
    res.json({
      success: false,
      message: error
    });
  }
}

// đăng nhập admin
export const adminLogin = async (req, res, next) => {
  try {
    const  { email, password } = req.body;
    if(validator.isEmail(email)){
      await Admin.find({email:email})
      .then((result) => {
        if(result.length === 0) {
          res.json({
            success:false,
            message:"Không tìm thấy tài khoản này!",
          });
        }else {
          result.map(item => {
            bcrypt.compare(password, item.password).then(function(match) {
              if(match) {
                // tạo token chứa thôn tin của admin, hết hạn sau 24h
                const token = jwt.sign({id:item._id, name:item.name, surname:item.surname, email:item.email}, process.env.TOKEN_SECRET, {expiresIn: '24h'})
                res.json({
                  success:true,
                  message:"Chào mừng "+item.name+' '+item.surname,
                  user: item,
                  token:token
                })
              }else {
                res.json({
                  success:false,
                  message:"Sai mật khẩu. Nhập lại lẹ lên!"
                })
              }
            });
          })
        }
      })
    }else {
      res.json({
        success:false,
        message: "Định dạng email không hợp lệ!"
      })
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal error"
    })
  }
}

// cập nhật thông tin admin
export const profile = async ( req, res, next ) => {
  const id = req.params.id;
  const { name, surname, email, password } = req.body;

  if(validator.isEmail(email)){
    await bcrypt.hash(password, 10, (err, hash) => {
      if(err){
        res.json({
          success:false,
          message: "Không thể mã hóa mật khẩu này!",
        })
      }else {
        // tìm và cập nhật thông tin admin
        Admin.findByIdAndUpdate(
          { _id:id }, 
          {
            $set: {
              name:name,
              surname:surname,
              email:email,
              password:hash
            }
          }, 
          // trả về dữ liệu mới đã cập nhật
          {new:true})
          .then((docs) => {
          res.json({
            success: true,
            message: "Thông tin đã được cập nhật thành công.",
            user:docs
          });
        })
        .catch(err => {
          res.json({
            success: false,
            message: `Không thể cập nhật thông tin của admin mã=${id}.`
          });
        });
      }
    })
  }else {
    res.json({                  
      success:false,
      message: "Định dạng email không hợp lệ!"
    })
  }
}