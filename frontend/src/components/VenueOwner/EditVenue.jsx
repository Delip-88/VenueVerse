import { useState, useEffect, useContext } from "react";
import { Loader, PlusCircle, Trash2, Upload, X } from "lucide-react";
import { useUploadImage } from "../Functions/UploadImage";
import { useDeleteImage } from "../Functions/deleteImage";
import { AuthContext } from "../../middleware/AuthContext";
import { useMutation, useQuery } from "@apollo/client";
import {  UPDATE_VENUE } from "../Graphql/mutations/VenueGql";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { VENUE_BY_ID } from "../Graphql/query/venuesGql";

const EditVenue = () => {
  const { id } = useParams();

  const { data, loading, error } = useQuery(VENUE_BY_ID, {
    variables: { id },
  });

  const navigate = useNavigate();

  const { CLOUD_NAME } = useContext(AuthContext);
  const [venue, setVenue] = useState({
    name: "",
    description: "",
    location: {
      street: "",
      province: "",
      city: "",
      zipCode: "",
    },
    pricePerHour: "",
    capacity: "",
    facilities: [],
    image: null,
  });

  useEffect(() => {
    if (data?.venue) {
      setVenue(data?.venue);
    }
  }, [data]);

  const [facility, setFacility] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [cities, setCities] = useState([]);
  const [cityData, setCityData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { uploadImage, loading: uLoading } = useUploadImage();
  const { deleteImage, loading: dLoading } = useDeleteImage();
  const [updateVenue, { loading: vLoading, error: vError }] =
    useMutation(UPDATE_VENUE);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    setCityData({
      Koshi: [
        "Biratnagar",
        "Dharan",
        "Itahari",
        "Birtamod",
        "Dhankuta",
        "Inaruwa",
        "Mechinagar",
      ],
      Madhesh: [
        "Janakpur",
        "Birgunj",
        "Kalaiya",
        "Rajbiraj",
        "Gaur",
        "Lahan",
        "Malangwa",
      ],
      Bagmati: [
        "Kathmandu",
        "Lalitpur",
        "Bhaktapur",
        "Hetauda",
        "Chitwan",
        "Banepa",
        "Sindhuli",
      ],
      Gandaki: [
        "Pokhara",
        "Baglung",
        "Damauli",
        "Beni",
        "Gorkha",
        "Waling",
        "Tansen",
      ],
      Lumbini: [
        "Butwal",
        "Nepalgunj",
        "Dang",
        "Tulsipur",
        "Kapilvastu",
        "Bardiya",
        "Sandhikharka",
      ],
      Karnali: [
        "Surkhet",
        "Jumla",
        "Dailekh",
        "Kalikot",
        "Mugu",
        "Jajarkot",
        "Dolpa",
      ],
      Sudurpashchim: [
        "Dhangadhi",
        "Mahendranagar",
        "Dadeldhura",
        "Baitadi",
        "Darchula",
        "Tikapur",
        "Amargadhi",
      ],
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setVenue((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
      if (locationField === "province") {
        setCities(cityData[value] || []);
        setVenue((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            city: "",
          },
        }));
      }
    } else {
      setVenue((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFacilityAdd = () => {
    if (facility.trim()) {
      setVenue((prev) => ({
        ...prev,
        facilities: [...prev.facilities, facility.trim()],
      }));
      setFacility("");
    }
  };

  const handleFacilityRemove = (index) => {
    setVenue((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVenue((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageRemove = () => {
    setVenue((prev) => ({ ...prev, image: null }));
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let requiredImageProps = null;

    const venueMutation = async () => {
      if (venue.image) {
        try {
          const imageData = await uploadImage(
            CLOUD_NAME,
            venue.image,
            import.meta.env.VITE_SIGNED_UPLOAD_PRESET,
            import.meta.env.VITE_UPLOAD_VENUE_IMAGE_FOLDER,
            "Venue"
          );
          if (!imageData) throw new Error("Failed to upload image");

          requiredImageProps = {
            public_id: imageData.public_id,
            secure_url: imageData.secure_url,
            asset_id: imageData.asset_id,
            version: Number.parseInt(imageData.version, 10),
            format: imageData.format,
            width: Number.parseInt(imageData.width, 10),
            height: Number.parseInt(imageData.height, 10),
            created_at: imageData.created_at,
          };
        } catch (error) {
          console.error("Image Upload Error:", error);
          throw new Error("Image upload failed");
        }
      }

      try {
        const imageWithoutTypename = requiredImageProps
          ? (({ __typename, ...rest }) => rest)(requiredImageProps)
          : null;

        const response = await updateVenue({
          variables: {
            updateVenueInput: {
              name: venue.name,
              description: venue.description,
              location: {
                ...venue.location,
                zipCode: venue.location.zipCode
                  ? parseInt(venue.location.zipCode, 10)
                  : null,
                  __typename : undefined
              },
              pricePerHour: venue.pricePerHour ? parseInt(venue.pricePerHour, 10) : null,
              capacity: venue.capacity ? parseInt(venue.capacity, 10) : null,
              facilities: venue.facilities,
              image: imageWithoutTypename,
            },
            id
          },
        });

        const {success, message} = response.data?.updateVenue
        if(!success){
            throw new Error("Failed to create venue");
        }

        return true
      } catch (err) {
        console.error("GraphQL Error:", err);
        if (requiredImageProps) {
          try {
            await deleteImage(CLOUD_NAME, requiredImageProps.public_id);
          } catch (deleteError) {
            console.error("Image Delete Error:", deleteError);
          }
        }
        throw new Error("Venue creation failed");
      }
    };

    toast
      .promise(venueMutation(), {
        loading: "Updating venue...",
        success: "Venue updated successfully!",
        error: "Failed to update venue. Please try again.",
      })
      .then(() => {
        setVenue({
          name: "",
          description: "",
          location: {
            street: "",
            province: "",
            city: "",
            zipCode: "",
          },
          pricePerHour: "",
          capacity: "",
          facilities: [],
          image: null,
        });
        navigate("/dashboard");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!data?.venue) return <div className="text-gray-500">Venue not found</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Venue</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={venue.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={venue.description}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <div className="mt-1 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <label
                htmlFor="province"
                className="block text-sm font-medium text-gray-700"
              >
                Province
              </label>
              <select
                id="province"
                name="location.province"
                value={venue.location.province}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Select a province</option>
                {Object.keys(cityData).map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                City
              </label>
              <select
                id="city"
                name="location.city"
                value={venue.location.city}
                onChange={handleChange}
                required
                disabled={!venue.location.province}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="street"
                className="block text-sm font-medium text-gray-700"
              >
                Street
              </label>
              <input
                type="text"
                id="street"
                name="location.street"
                value={venue.location.street}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="zipCode"
                className="block text-sm font-medium text-gray-700"
              >
                ZIP Code
              </label>
              <input
                type="number"
                id="zipCode"
                name="location.zipCode"
                value={venue.location.zipCode}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="pricePerHour"
            className="block text-sm font-medium text-gray-700"
          >
            Price per Hour
          </label>
          <input
            type="number"
            id="pricePerHour"
            name="pricePerHour"
            value={venue.pricePerHour}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="capacity"
            className="block text-sm font-medium text-gray-700"
          >
            Capacity
          </label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={venue.capacity}
            onChange={handleChange}
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Facilities
          </label>
          <div className="flex items-center mt-1">
            <input
              type="text"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Add a facility"
            />
            <button
              type="button"
              onClick={handleFacilityAdd}
              className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {venue.facilities.map((fac, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {fac}
                <button
                  type="button"
                  onClick={() => handleFacilityRemove(index)}
                  className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-indigo-200 text-indigo-500 hover:bg-indigo-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="image"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload an image</span>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {imagePreview && (
            <div className="mt-4 relative">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Venue preview"
                className="h-32 w-32 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={handleImageRemove}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                aria-label="Remove image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Updating Venue...
              </>
            ) : (
              "Edit Venue"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVenue;
