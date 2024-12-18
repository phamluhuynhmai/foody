import { Client } from './../models/Client.js'

// truy xuất toàn bộ dữ liệu của khách hàng từ csdl
export const findAll = async ( req, res, next ) => {
  const clients = await Client.find()
// trả về với trạng thái thành công
  res.json({
    success: true,
    clients: clients
  })
}

// cập nhật trạng thái của một khách hàng dựa trên id
export const handleStatus = async ( req, res, next ) => {
  const id = req.params.id; // lấy id từ req.param
  const status = req.body.status  // lấy trạng thái mới từ req.body

  await Client.findByIdAndUpdate(
    {_id: id}, // tìm khách hàng theo id
    {status:status}, // thay đổi trường status thành giá trị mới
    {new: true } // trả về đối tượng mới được cập nhật
  )
  .then(() => {
    res.json({
      success: true,
      message: "Tài khoản đã được kích hoạt."
    });
  })
  .catch(err => {
    res.json({
      success: false,
      message: `Không thể kích hoạt tài khoản của khách hàng có id=${id}.`
    });
  });
}

// xóa một khách hàng khỏi csdl bằng id 
export const remove = async ( req, res, next ) => {
  const id = req.params.id;
  await Client.deleteOne({_id: id})
  .then(() => {
    res.json({
      success: true,
      message: "Đã xóa khách hàng thành công!"
    });
  })
  .catch(err => {
    res.json({
      success: false,
      message: `Không thể xóa khách hàng có id=${id}.`
    });
  });
}