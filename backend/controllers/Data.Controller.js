import { Client } from './../models/Client.js'
import { Employe } from './../models/Employe.js'
import { Restaurant } from './../models/Restaurant.js'
import { Order } from './../models/Order.js'

// cung cấp số liệu thống kê tổng quan
// truy vấn và đếm dữ liệu từ các bảng trong MongoDB
export const dashbord = async (req, res, next) => {
  const clients = await Client.find().count();
  const empolyes = await Employe.find().count(); 
  const restaurants = await Restaurant.find().count();    
  const orders = await Order.find().count();    
  
// trả về json
  res.json({
    success: true,
    clients: clients,
    empolyes:empolyes,
    restaurants:restaurants,
    orders: orders
  })
}