import { Client } from './../models/Client.js'
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import { sendMail } from './../helpers/email.helper.js'

// đăng ký tài khoản khách hàng
export const register = async (req, res, next) => {
  try {
    const { name, surname, phone, address, state, email, password } = req.body;
    if(validator.isEmail(email)){
      await Client.find({email:email})
      .then(result => {
        if(result.length >=1) {
          res.json({
            success: false,
            message: "Người dùng đã tồn tại!"
          });
        }else {
          bcrypt.hash(password, 10, (err, hash) => {
            if(err){
              res.json({
                success:false,
                message: "Lỗi, không thể mã hóa mật khẩu này!",
              })
            }else {
              // mã hóa mật khẩu bằng CryptoJS
              const plainPassword = CryptoJS.AES.encrypt(password, process.env.CRYPTO_SECRET).toString();
              // tạo khách hàng mới lưu vào MongoDB
              let client = new Client ({
                name:name, 
                surname:surname,
                phone:phone,
                address: address,
                state:state, 
                email:email, 
                password:hash,
                plainPassword: plainPassword
              })
              client.save((err, doc) => {
                if(err){
                  res.json({
                    success: false,
                    message: `Không thể tạo tài khoản này.`
                  });
                }else {
                  res.json({
                    success: true,
                    message: "Tài khoản của bạn đã được tạo thành công.",
                    user: doc
                  });
                } 
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

// khách hàng đăng nhập
export const login = async (req, res, next) => {
  try {
    const  { email, password } = req.body;
    if(validator.isEmail(email)){
      await Client.find({email:email})
      .then((result) => {
        if(result.length === 0) {
          res.json({
            success:false,
            message:"Không tìm thấy người dùng!"
          });
        }else {
          result.map(item => {
            bcrypt.compare(password, item.password).then(function(match) {
              if(match) {
                if(item.status) {
                  const token = jwt.sign({
                    id:item._id, 
                    name:item.name, 
                    surname:item.surname, 
                    email:item.email
                  }, process.env.TOKEN_SECRET, {expiresIn: '24h'})
                  res.json({
                    success:true,
                    message:"Chào mừng "+item.name+' '+item.surname,
                    user: item,
                    token:token
                  })
                }else {
                  res.json({
                    success:false,
                    message:'Tài khoản của bạn chưa được kích hoạt!'
                  })
                }
              }else {
                res.json({
                  success:false,
                  message:"Sai mật khẩu. Nhập lại đi má!"
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

// khách hàng cập nhật hồ sơ
export const profile = async ( req, res, next ) => {
  const id = req.params.id;
  const { name, surname, phone, address, state } = req.body;
  await Client.findByIdAndUpdate(
    {_id: id},
    { 
      $set:{
        name:name, 
        surname:surname,
        phone:phone,
        address: address,
        state:state, 
      }
    },
    {new:true}
  ).then(() => {
    res.json({
      success: true,
      message: "Thông tin của bạn đã được cập nhật thành công."
    });
  }).catch((error) => {
    res.json({
      success: false,
      message: error
    });
  })
}

// khôi phục mật khẩu khách hàng
export const resetpassword = async( req, res, next ) => {
  const { email } = req.body;
// tìm tài khoản theo email
  await Client.find({email:email})
  .then((result) => {
    if(result.length === 0) {
      res.json({
        success:false,
        message:"Email "+email+" không tồn tại, vui lồng kiểm tra lại email đã nhập",
      });
    }else {
      result.map(item => {
        let plainpass = CryptoJS.AES.decrypt(item.plainPassword, process.env.CRYPTO_SECRET).toString(CryptoJS.enc.Utf8);
        var message = {
          from: "shopeefood@application.com",
          to: email,
          subject: "Reset Email",
          html: "<p> Xin chào, <strong>"+item.name+' '+item.surname+"</strong> </p> <br> <p> Mật khẩu của bạn: <strong>"+plainpass +"</strong></p>"
        }
        let mail = sendMail(message);
        res.json({
          success: true,
          message: "Kiểm tra email của bạn để tìm mật khẩu"
        })
      })
    }
  })
}

// đổi mật khẩu
export const changePassword = async (req, res, next) => {
  const id = req.params.id;
  const { currentPassword, newPassword } = req.body;
  await Client.find({_id:id})
  .then((result) => {
    if(result.length === 0) {
      res.json({
        success:false,
        message:"Không tìm thấy người dùng",
      });
    }else {
      result.map(item => {
        bcrypt.compare(currentPassword, item.password).then(function(match) {
          if(match) {
            bcrypt.hash(newPassword, 10, (err, hash) => {
              if(err){
                res.json({
                  success:false,
                  message: "Đã xảy ra lỗi, không thể mã hóa mật khẩu mới",
                })
              }else {
                const plainPassword = CryptoJS.AES.encrypt(newPassword, process.env.CRYPTO_SECRET).toString();
                Client.findByIdAndUpdate(
                  {
                    _id:id
                  },
                  {
                    $set:{
                      password:hash,
                      plainPassword: plainPassword
                    }
                  },
                  { new: true }
                ).then(() => {
                  res.json({
                    success: true,
                    message: "Mật khẩu của bạn đã được cập nhật thành công."
                  });
                }).catch((error) => {
                  res.json({
                    success: false,
                    message: error
                  });
                })
              }
            })
          }else {
            res.json({
              success:false,
              message:"Mật khẩu sai, vui lòng kiểm tra mật khẩu hiện tại của bạn!"
            })
          }
        });
      })
    }
  })

}

// đổi email
export const ChangeEmail = async( req, res, next ) => {
  const id = req.params.id;
  const { currentEmail, newEmail } = req.body;
  if(validator.isEmail(currentEmail) || validator.isEmail(newEmail)){
    await Client.find({email:currentEmail, _id:id})
    .then((result) => {
      if(result.length === 0) {
        res.json({
          success:false,
          message:"Email này "+currentEmail+" không phải của bạn, vui lòng kiểm tra email hiện tại của bạn!",
        });
      }else {
        Client.findByIdAndUpdate(
          {_id: id},
          {
            $set:{email:newEmail}
          },
          {
            new:true
          }
        ).then(() => {
          res.json({
            success: true,
            message: "Email của bạn đã được cập nhật thành công thành "+newEmail
          });
        }).catch((err) => {
          res.json({
            success: false,
            message: err
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

}