import { Router } from "express";
import { ProductModel } from "../models/Products";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const list = await ProductModel.find().lean();
    const mapped = list.map(p => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      rating: p.rating,
      tags: p.tags,
      platform: p.platform,
      dealType: p.dealType
    }));
    res.json(mapped);
  } catch (err) {
    next(err);
  }
});

router.get("/:id" , async( req , res , next)=>{
  const _id = req.params.id;
  try {
    const lists = await ProductModel.findById(_id);
    res.json(lists);
  } catch (error) {
    next(error)
  }
});


router.post("/bulk", async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "ids must be an array" });
    }

    const products = await ProductModel.find({ _id: { $in: ids } });

    return res.json({ products });
  } catch (error) {
    next(error);
  }
});







export default router;