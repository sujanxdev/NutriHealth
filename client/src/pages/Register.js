import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import avatar from "../assets/profile.png";
import toast, { Toaster } from "react-hot-toast";
import { useFormik } from "formik";
import { registerValidation } from "../helper/validate";
import convertToBase64 from "../helper/convert";
import { registerUser } from "../helper/helper";
import { motion } from "framer-motion";

import styles from "../styles/Username.module.css";

export default function Register() {
  const navigate = useNavigate();
  const [file, setFile] = useState();

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      password: "",
    },
    validate: registerValidation,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      values = await Object.assign(values, { profile: file || "" });
      let registerPromise = registerUser(values);
      toast.promise(registerPromise, {
        loading: "Creating...",
        success: <b>Registered Successfully!</b>,
        error: <b>Could not register.</b>,
      });

      registerPromise.then(() => navigate("/username"));
    },
  });

  /** Custom handler for file upload */
  const onUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("No file selected.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // Limit: 2MB
      toast.error("File size exceeds 2MB.");
      return;
    }
    const base64 = await convertToBase64(file);
    setFile(base64);
  };

  return (
    <div className="container mx-auto">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="flex justify-center items-center h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className={styles.glass}
            style={{ width: "45%", paddingTop: "3em" }}
          >
            <div className="title flex flex-col items-center">
              <h4 className="text-5xl font-bold text-white">Sign Up</h4>
              <span className="py-4 text-xl w-2/3 text-center text-white">
                Welcome to NutriHealth!
              </span>
            </div>

            <form className="py-1" onSubmit={formik.handleSubmit}>
              <div className="profile flex justify-center py-4">
                <label htmlFor="profile">
                  <img
                    src={file || avatar}
                    className={styles.profile_img}
                    alt="avatar"
                  />
                </label>
                <input
                  onChange={onUpload}
                  type="file"
                  id="profile"
                  name="profile"
                  accept="image/*"
                  style={{ display: "none" }}
                  aria-label="Profile Image"
                />
              </div>

              <div className="textbox flex flex-col items-center gap-6">
                <input
                  {...formik.getFieldProps("email")}
                  className={styles.textbox}
                  type="text"
                  placeholder="Email*"
                />
                {formik.errors.email && (
                  <div className="text-red-500 text-sm">{formik.errors.email}</div>
                )}
                <input
                  {...formik.getFieldProps("username")}
                  className={styles.textbox}
                  type="text"
                  placeholder="Username*"
                />
                {formik.errors.username && (
                  <div className="text-red-500 text-sm">{formik.errors.username}</div>
                )}
                <input
                  {...formik.getFieldProps("password")}
                  className={styles.textbox}
                  type="password"
                  placeholder="Password*"
                />
                {formik.errors.password && (
                  <div className="text-red-500 text-sm">{formik.errors.password}</div>
                )}
                <button className={styles.btn} type="submit">
                  Register
                </button>
              </div>

              <div className="text-center py-4">
                <span className="text-white">
                  Already registered?{" "}
                  <Link className="text-red-500" to="/username">
                    Login Now
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
