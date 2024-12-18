import { Employe } from './../models/Employe.js'
import bcrypt from 'bcrypt'; // module mã hóa mật khẩu
import validator from 'validator'; // module xác thực email
import { sendMail } from './../helpers/email.helper.js' // module gửi email

// lấy danh sách tất cả nhân viên
const findAll = async ( req, res, next ) => {
  const employes = await Employe.find();
  res.json({
    success: true,
    employes: employes // trả về danh sách nhân viên
  });
}

// tìm nhân viên theo trạng thái và có sẵn
const findByState = async ( req, res, next ) => {
  const etat = req.params.etat; // trạng thái được truyền từ URL
  const employes = await Employe.find({etat:etat, disponibilite:true});
  res.json({
    success: true,
    employes: employes
  });
}

// tạo mới nhân viên
const create = async ( req, res, next ) => {
  const { nom, prenom, telephone, email, password, etat, restaurentId } = req.body; // lấy dữ liệu từ body
  if(validator.isEmail(email)){ // kiểm tra định dạng email
    await Employe.find({email:email})
    .then(result => {
      if(result.length >=1) {
        res.json({
          success: false,
          message: "Email đã tồn tại!"
        });
      } else {
        bcrypt.hash(password, 10, (err, hash) => { // mã hóa mật khẩu
          if(err){
            res.json({
              success:false,
              message: "Lỗi, không thể mã hóa mật khẩu!",
            });
          } else {
            let employe = new Employe ({
              nom: nom, 
              prenom: prenom, 
              telephone: telephone, 
              email: email, 
              password: hash, 
              etat: etat, 
              restaurentId: restaurentId
            });
            var message = {
              from: "shopeefood@application.com",
              to: email,
              subject: "Tài khoản nhân viên mới",
              html: `<p>Xin chào, <strong>${nom} ${prenom}</strong></p> 
                     <br> <p>Email và mật khẩu tài khoản của bạn là: 
                     <strong>${email}</strong> ****** Mật khẩu: <strong>${password}</strong></p>`
            };
            employe.save().then(() => {
              let mail = sendMail(message); // gửi email
              console.log(mail);
              res.json({
                success: true,
                message: "Đã tạo nhân viên thành công.", // Thông báo thành công
              });
            }).catch(err => {
              res.json({
                success: false,
                message: "Không thể tạo nhân viên này."
              });
            });
          }
        });
      }
    });
  } else {
    res.json({                  
      success: false,
      message: "Định dạng email không hợp lệ!"
    });
  }
}

// cập nhật trạng thái khả dụng của nhân viên
const available = async ( req, res, next ) => {
  const id = req.params.id; // lấy ID từ URL
  const disp = req.body.disponibilite; // lấy trạng thái khả dụng từ body
  await Employe.findByIdAndUpdate(
    {_id: id},
    {
      $set:{
        disponibilite: disp
      }
    },
    { new: true }
  )
  .then(() => {
    res.json({
      success: true,
      message: "Trạng thái nhân viên đã được cập nhật thành công."
    });
  })
  .catch(err => {
    res.json({
      success: false,
      message: `Không thể cập nhật trạng thái của nhân viên có id=${id}.`
    });
  });
}

// cập nhật thông tin nhân viên
const update = async ( req, res, next ) => {
  const id = req.params.id;
  const { nom, prenom, telephone, email, password, etat, restaurentId } = req.body;

  if(validator.isEmail(email)){
    await bcrypt.hash(password, 10, (err, hash) => {
      if(err){
        res.json({
          success:false,
          message: "Lỗi, không thể mã hóa mật khẩu!",
        });
      } else {
        var message = {
          from: "shopeefood@application.com",
          to: email,
          subject: "Cập nhật tài khoản nhân viên",
          html: `<p>Xin chào, <strong>${nom} ${prenom}</strong></p> 
                 <br> <p>Email và mật khẩu tài khoản của bạn là: 
                 <strong>${email}</strong> ****** Mật khẩu: <strong>${password}</strong></p>`
        };
        
        Employe.findByIdAndUpdate(
          {_id: id},
          {
            $set: {
              nom: nom,
              prenom: prenom,
              telephone: telephone,
              email: email,
              password: hash,
              etat: etat,
              restaurentId: restaurentId
            }
          }, 
          { new: true }
        )
        .then(() => {
          let mail = sendMail(message);
          res.json({
            success: true,
            message: "Thông tin nhân viên đã được cập nhật thành công.",
          });
        })
        .catch(err => {
          res.json({
            success: false,
            message: `Không thể cập nhật nhân viên có id=${id}.`
          });
        });
      }
    });
  } else {
    res.json({                  
      success: false,
      message: "Định dạng email không hợp lệ!"
    });
  }
}

// xóa nhân viên
const remove = async ( req, res, next ) => {
  const id = req.params.id;
  await Employe.deleteOne({ _id: id })
  .then(() => {
    res.json({
      success: true,
      message: "Đã xóa nhân viên thành công!"
    });
  })
  .catch(err => {
    res.json({
      success: false,
      message: `Không thể xóa nhân viên có id=${id}.`
    });
  });
}

// xuất các hàm để sử dụng ở nơi khác
export {
  findAll,
  findByState,
  create,
  available,
  update,
  remove
};