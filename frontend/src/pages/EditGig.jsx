import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

import {
  showError,
  showLoading,
  updateToast,
} from "../utils/toast";

const EditGig = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    deliveryTime: "",
  });

  const [avatar, setAvatar] =
    useState(null);

  const [coverImage,
    setCoverImage] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [updating,
    setUpdating] =
    useState(false);

  // ==========================================
  // FETCH EXISTING GIG
  // ==========================================

  useEffect(() => {

    const fetchGig = async () => {

      try {

        const res =
          await API.get(
            `/gigs/${id}`
          );

        const gig =
          res.data.gig ||
          res.data;

        setForm(gig);

      } catch (err) {

        console.log(err);

        showError(
          "Failed to load gig"
        );

      } finally {

        setLoading(false);
      }
    };

    fetchGig();

  }, [id]);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  // ==========================================
  // UPDATE GIG
  // ==========================================

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    const toastId =
      showLoading(
        "Updating gig..."
      );

    try {

      setUpdating(true);

      const formData =
        new FormData();

      formData.append(
        "title",
        form.title
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "price",
        form.price
      );

      formData.append(
        "category",
        form.category
      );

      formData.append(
        "deliveryTime",
        form.deliveryTime
      );

      // optional new image
      if (avatar) {

        formData.append(
          "avatar",
          avatar
        );
      }

      // optional new cover
      if (coverImage) {

        formData.append(
          "coverImage",
          coverImage
        );
      }

      await API.put(
        `/gigs/${id}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      updateToast(
        toastId,
        "Gig updated successfully ✅"
      );

      navigate("/my-gigs");

    } catch (err) {

      console.log(err);

      updateToast(
        toastId,
        err.response?.data
          ?.message ||
          "Update failed",
        "error"
      );

    } finally {

      setUpdating(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border">

        <h1 className="text-3xl font-bold mb-6">
          Edit Gig
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* CURRENT IMAGE */}
          <div>

            <p className="font-medium mb-2">
              Current Thumbnail
            </p>

            <img
              src={
                form.avatar?.url ||
                form.avatar ||
                "/placeholder.jpg"
              }
              alt={form.title}
              className="w-40 h-40 rounded-xl object-cover border"
            />
          </div>

          {/* CHANGE AVATAR */}
          <div>

            <label className="block mb-2 font-medium">
              Change Thumbnail
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setAvatar(
                  e.target.files[0]
                )
              }
              className="w-full border p-3 rounded-lg"
            />
          </div>

          {/* CHANGE COVER */}
          <div>

            <label className="block mb-2 font-medium">
              Change Cover Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setCoverImage(
                  e.target.files[0]
                )
              }
              className="w-full border p-3 rounded-lg"
            />
          </div>

          {/* TITLE */}
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full p-3 border rounded-lg"
          />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            rows={5}
            className="w-full p-3 border rounded-lg"
          />

          {/* PRICE */}
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            className="w-full p-3 border rounded-lg"
          />

          {/* CATEGORY */}
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full p-3 border rounded-lg"
          />

          {/* DELIVERY */}
          <input
            type="number"
            name="deliveryTime"
            value={form.deliveryTime}
            onChange={handleChange}
            placeholder="Delivery Time"
            className="w-full p-3 border rounded-lg"
          />

          {/* SUBMIT */}
          <button
            disabled={updating}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl disabled:opacity-50"
          >
            {
              updating
                ? "Updating..."
                : "Update Gig"
            }
          </button>

        </form>

      </div>
    </div>
  );
};

export default EditGig;