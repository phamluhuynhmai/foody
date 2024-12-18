import { Item } from './../models/Item.js'

// lấy danh sách tất cả các món ăn theo menu ID
const findAll = async ( req, res, next ) => {
  const id = req.params.id; // lấy menuId từ tham số URL
  const items = await Item.find({menuId: id}); // tìm món ăn thuộc menuId
  res.json({
    success: true,
    items: items // trả về danh sách món ăn
  });
}

// tạo mới món ăn
const create = async ( req, res, next ) => {
  const { name, price, menuId } = req.body; // lấy dữ liệu từ body
  const image = req.file.path; // link ảnh được upload

  // k iểm tra xem món ăn đã tồn tại hay chưa
  await Item.find({name: name, price: price, menuId: menuId})
  .then(result => {
    if(result.length >= 1) {
      res.json({
        success: false,
        message: "Món ăn đã tồn tại!"
      });
    } else {
      let item = new Item({
        image: image,
        name: name, 
        price: price, 
        menuId: menuId
      });
      item.save().then(() => {
        res.json({
          success: true,
          message: "Món ăn đã được tạo thành công."
        });
      }).catch(err => {
        res.json({
          success: false,
          message: "Không thể tạo món ăn này."
        });
      });
    }
  });
}

// cập nhật thông tin món ăn
const update = async ( req, res, next ) => {
  const id = req.params.id;
  const { name, price, menuId } = req.body;
  const image = req.file.path; // link ảnh mới

  // cập nhật thông tin món ăn
  await Item.findByIdAndUpdate(
    {_id: id}, 
    {
      $set: {
        image: image,
        name: name, 
        price: price, 
        menuId: menuId
      }
    },
    { new: true }
  )
  .then(() => {
    res.json({
      success: true,
      message: "Thông tin món ăn đã được cập nhật thành công."
    });
  })
  .catch(err => {
    res.json({
      success: false,
      message: `Không thể cập nhật món ăn có id=${id}.`
    });
  });
}

// xóa món ăn
const remove = async ( req, res, next ) => {
  const id = req.params.id; // Lấy ID món ăn từ tham số URL
  await Item.deleteOne({_id: id})
  .then(() => {
    res.json({
      success: true,
      message: "Món ăn đã được xóa thành công!" // Thông báo thành công
    });
  })
  .catch(err => {
    res.json({
      success: false,
      message: `Không thể xóa món ăn với id=${id}.` // Lỗi khi xóa món ăn
    });
  });
}

// xuất các hàm để sử dụng ở nơi khác
export {
  findAll,
  create,
  update,
  remove
};
