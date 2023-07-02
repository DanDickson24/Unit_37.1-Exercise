
// const express = require("express");
// const slugify = require("slugify");
// const ExpressError = require("../expressError")
// const db = require("../db");

// let router = new express.Router();


// /** GET / => list of companies.
//  *
//  * =>  {companies: [{code, name, descrip}, {code, name, descrip}, ...]}
//  *
//  * */

// router.get("/", async function (req, res, next) {
//   try {
//     const result = await db.query(
//           `SELECT code, name 
//            FROM companies 
//            ORDER BY name`
//     );

//     return res.json({"companies": result.rows});
//   }

//   catch (err) {
//     return next(err);
//   }
// });


// /** GET /[code] => detail on company
//  *
//  * =>  {company: {code, name, descrip, invoices: [id, ...]}}
//  *
//  * */

// router.get("/:code", async function (req, res, next) {
//   try {
//     let code = req.params.code;

//     const compResult = await db.query(
//           `SELECT code, name, description
//            FROM companies
//            WHERE code = $1`,
//         [code]
//     );

//     const invResult = await db.query(
//           `SELECT id
//            FROM invoices
//            WHERE comp_code = $1`,
//         [code]
//     );

//     if (compResult.rows.length === 0) {
//       throw new ExpressError(`No such company: ${code}`, 404)
//     }

//     const company = compResult.rows[0];
//     const invoices = invResult.rows;

//     company.invoices = invoices.map(inv => inv.id);

//     return res.json({"company": company});
//   }

//   catch (err) {
//     return next(err);
//   }
// });



// router.post("/", async function (req, res, next) {
//   try {
//     let {name, description} = req.body;
//     let code = slugify(name, {lower: true});

//     const result = await db.query(
//           `INSERT INTO companies (code, name, description) 
//            VALUES ($1, $2, $3) 
//            RETURNING code, name, description`,
//         [code, name, description]);

//     return res.status(201).json({"company": result.rows[0]});
//   }

//   catch (err) {
//     return next(err);
//   }
// });



// router.put("/:code", async function (req, res, next) {
//   try {
//     let {name, description} = req.body;
//     let code = req.params.code;

//     const result = await db.query(
//           `UPDATE companies
//            SET name=$1, description=$2
//            WHERE code = $3
//            RETURNING code, name, description`,
//         [name, description, code]);

//     if (result.rows.length === 0) {
//       throw new ExpressError(`No such company: ${code}`, 404)
//     } else {
//       return res.json({"company": result.rows[0]});
//     }
//   }

//   catch (err) {
//     return next(err);
//   }

// });


// router.delete("/:code", async function (req, res, next) {
//   try {
//     let code = req.params.code;

//     const result = await db.query(
//           `DELETE FROM companies
//            WHERE code=$1
//            RETURNING code`,
//         [code]);

//     if (result.rows.length == 0) {
//       throw new ExpressError(`No such company: ${code}`, 404)
//     } else {
//       return res.json({"status": "deleted"});
//     }
//   }

//   catch (err) {
//     return next(err);
//   }
// });


// module.exports = router;

const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError");
const db = require("../db");

let router = new express.Router();

router.get("/", async function (req, res, next) {
  try {
    const result = await db.query(`SELECT code, name FROM companies ORDER BY name`);

    return res.json({ companies: result.rows });
  } catch (err) {
    return next(err);
  }
});

router.get("/:code", async function (req, res, next) {
  try {
    let code = req.params.code;

    const compResult = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [code]);

    const invResult = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [code]);

    if (compResult.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    }

    const company = compResult.rows[0];
    const invoices = invResult.rows;

    company.invoices = invoices.map((inv) => inv.id);

    return res.json({ company: company });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    let { name, description } = req.body;
    let code = slugify(name, { lower: true });

    const result = await db.query(
      `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
      [code, name, description]
    );

    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.get("/:code", async function (req, res, next) {
  try {
    let code = req.params.code;

    const compResult = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [code]);

    const indResult = await db.query(
      `SELECT i.code, i.industry FROM industries AS i
       JOIN company_industries AS ci ON (i.code = ci.industry_code)
       WHERE ci.company_code = $1`,
      [code]
    );

    if (compResult.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    }

    const company = compResult.rows[0];
    const industries = indResult.rows.map((row) => row.industry);

    company.industries = industries;

    return res.json({ company: company });
  } catch (err) {
    return next(err);
  }
});


router.delete("/:code", async function (req, res, next) {
  try {
    let code = req.params.code;

    const result = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING code`, [code]);

    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    } else {
      return res.json({ status: "deleted" });
    }
  } catch (err) {
    return next(err);
  }
});

router.post("/industries", async function (req, res, next) {
  try {
    let { code, industry } = req.body;

    const result = await db.query(
      `INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`,
      [code, industry]
    );

    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.post("/:code/industries", async function (req, res, next) {
  try {
    let { industryCode } = req.body;
    let companyCode = req.params.code;

    await db.query(
      `INSERT INTO company_industries (company_code, industry_code) VALUES ($1, $2)`,
      [companyCode, industryCode]
    );

    return res.status(201).json({ status: "success" });
  } catch (err) {
    return next(err);
  }
});



module.exports = router;
