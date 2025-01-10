import React, { useState } from "react";
import NavigationMenu from "../components/NavigationMenu";
import MenuIcon from "@mui/icons-material/Menu";
import CheckIcon from "@mui/icons-material/Check";
import image from "../assets/man 1.png";
import image3 from "../assets/woman 1.png";
import { useNavigate } from "react-router-dom"; // Updated for react-router-dom v6
import SupplementLoader from "../components/SupplementLoader"; // Import the loader

function QuestioneerPage() {
  const navigate = useNavigate(); // Updated for react-router-dom v6
  const [currentSet, setCurrentSet] = useState(1);
  const [selectedDivSet1, setSelectedDivSet1] = useState(null);
  const [allergicFoods, setAllergicFoods] = useState("");
  const [healthGoals, setHealthGoals] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDivClick = (set, index) => {
    if (set === 1) {
      setSelectedDivSet1(selectedDivSet1 === index ? null : index);
    }
  };

  const handleNext = () => {
    if (currentSet < 4) {
      setCurrentSet(currentSet + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSet > 1) {
      setCurrentSet(currentSet - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Hide the last set of questions
    setCurrentSet(null);

    const data = {
      gender,
      age: parseInt(age), // Convert age to integer
      allergic_food: allergicFoods, // This will be a string (comma-separated foods)
      health_goals: healthGoals, // This will be a string
    };

    console.log("Sent Data:", data); // Log the data sent to Flask

    try {
      // Send data to the backend
      const response = await fetch(
        "http://localhost:8080/api/getRecommendation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      console.log("Received Response:", result); // Log the response from Flask

      if (response.ok) {
        localStorage.setItem(
          "recommendations",
          JSON.stringify(result.recommendations || [])
        );
        navigate("/recommendations");
      } else {
        console.error("Error:", result.error);
        alert(result.error);
      }
    } catch (error) {
      console.error("Request failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Question Set 1 */}
      {currentSet === 1 && (
        <div
          className="w-[100%] h-[100vh] flex flex-col justify-center items-center gap-10"
          id="questionSet1"
        >
          <NavigationMenu
            style={{
              position: "fixed",
              top: "10px",
              right: "10px",
              zIndex: 50,
              cursor: "pointer",
              width: "80px",
              height: "50px",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <MenuIcon style={{ color: "black" }} />
          </NavigationMenu>

          <h1 className="text-[30px] text-white">Please select your gender</h1>

          <div className="w-[1000px] h-[500px] flex justify-between">
            <div
              className={`w-[48%] h-[100%] bg-slate-800 rounded-xl cursor-pointer relative
                ${
                  selectedDivSet1 === 1
                    ? "outline outline-white outline-2 outline-offset-2"
                    : ""
                }
                hover:outline hover:outline-white hover:outline-2 hover:outline-offset-2 flex justify-center items-center flex-col gap-10`}
              onClick={() => {
                handleDivClick(1, 1);
                setGender("Male");
              }}
              style={{
                transition: "outline-width 0.3s ease, outline-color 0.3s ease",
              }}
            >
              {selectedDivSet1 === 1 && (
                <CheckIcon
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    color: "black",
                    fontSize: "25px",
                    backgroundColor: "white",
                    borderRadius: "5px",
                  }}
                />
              )}
              <div className="w-[200px] h-[200px] rounded-[100px]">
                <img
                  src={image}
                  className="w-[200px] h-[200px] rounded-[100px]"
                />
              </div>
              <label className="text-[28px] text-white">Male</label>
            </div>

            <div
              className={`w-[48%] h-[100%] bg-slate-800 rounded-xl cursor-pointer relative
                ${
                  selectedDivSet1 === 2
                    ? "outline outline-white outline-2 outline-offset-2"
                    : ""
                }
                hover:outline hover:outline-white hover:outline-2 hover:outline-offset-2 flex justify-center items-center flex-col gap-10`}
              onClick={() => {
                handleDivClick(1, 2);
                setGender("Female");
              }}
              style={{
                transition: "outline-width 0.3s ease, outline-color 0.3s ease",
              }}
            >
              {selectedDivSet1 === 2 && (
                <CheckIcon
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    color: "black",
                    fontSize: "25px",
                    backgroundColor: "white",
                    borderRadius: "5px",
                  }}
                />
              )}
              <div className="w-[200px] h-[200px] rounded-[100px]">
                <img
                  src={image3}
                  className="w-[200px] h-[200px] rounded-[100px]"
                />
              </div>
              <label className="text-[28px] text-white">Female</label>
            </div>
          </div>

          <div className="flex gap-5">
            <button
              type="button"
              disabled={true}
              className="w-[150px] h-[50px] bg-gray-400 text-white text-lg font-semibold rounded-md flex items-center justify-center cursor-not-allowed"
            >
              PREVIOUS
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-[150px] h-[50px] bg-slate-800 text-white text-lg font-semibold rounded-md flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all duration-300 ease-in-out"
            >
              NEXT
            </button>
          </div>
        </div>
      )}

      {/* Question Set 2 */}
      {currentSet === 2 && (
        <div
          className="w-[100%] h-[100vh] flex flex-col justify-center items-center gap-10"
          id="questionSet2"
        >
          <NavigationMenu
            style={{
              position: "fixed",
              top: "10px",
              right: "10px",
              zIndex: 50,
              cursor: "pointer",
              width: "80px",
              height: "50px",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <MenuIcon style={{ color: "black" }} />
          </NavigationMenu>

          <h1 className="text-[30px] text-white">What's your age?</h1>

          <input
            type="text"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
            className="w-[300px] h-[40px] p-[10px] text-black rounded-md mt-5"
          />

          <div className="flex gap-5">
            <button
              type="button"
              onClick={handlePrevious}
              className="w-[150px] h-[50px] bg-slate-800 text-white text-lg font-semibold rounded-md flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all duration-300 ease-in-out"
            >
              PREVIOUS
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-[150px] h-[50px] bg-slate-800 text-white text-lg font-semibold rounded-md flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all duration-300 ease-in-out"
            >
              NEXT
            </button>
          </div>
        </div>
      )}

      {/* Question Set 3 */}
      {currentSet === 3 && (
        <div
          className="w-[100%] h-[100vh] flex flex-col justify-center items-center gap-10"
          id="questionSet3"
        >
          <NavigationMenu
            style={{
              position: "fixed",
              top: "10px",
              right: "10px",
              zIndex: 50,
              cursor: "pointer",
              width: "80px",
              height: "50px",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <MenuIcon style={{ color: "black" }} />
          </NavigationMenu>

          <h1 className="text-[30px] text-white">Any allergic foods?</h1>

          <input
            type="text"
            value={allergicFoods}
            onChange={(e) => setAllergicFoods(e.target.value)}
            placeholder="List your allergic foods"
            className="w-[300px] h-[40px] p-[10px] text-black rounded-md mt-5"
          />

          <div className="flex gap-5">
            <button
              type="button"
              onClick={handlePrevious}
              className="w-[150px] h-[50px] bg-slate-800 text-white text-lg font-semibold rounded-md flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all duration-300 ease-in-out"
            >
              PREVIOUS
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-[150px] h-[50px] bg-slate-800 text-white text-lg font-semibold rounded-md flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all duration-300 ease-in-out"
            >
              NEXT
            </button>
          </div>
        </div>
      )}

      {/* Question Set 4 */}
      {currentSet === 4 && (
        <div
          className="w-[100%] h-[100vh] flex flex-col justify-center items-center gap-10"
          id="questionSet4"
        >
          <NavigationMenu
            style={{
              position: "fixed",
              top: "10px",
              right: "10px",
              zIndex: 50,
              cursor: "pointer",
              width: "80px",
              height: "50px",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <MenuIcon style={{ color: "black" }} />
          </NavigationMenu>

          <h1 className="text-[30px] text-white">
            What are your health goals?
          </h1>

          <input
            type="text"
            value={healthGoals}
            onChange={(e) => setHealthGoals(e.target.value)}
            placeholder="Enter your health goals"
            className="w-[300px] h-[40px] p-[10px] text-black rounded-md mt-5"
          />

          <div className="flex gap-5">
            <button
              type="button"
              onClick={handlePrevious}
              className="w-[150px] h-[50px] bg-slate-800 text-white text-lg font-semibold rounded-md flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all duration-300 ease-in-out"
            >
              PREVIOUS
            </button>
            <button
              type="submit"
              className="w-[150px] h-[50px] bg-slate-800 text-white text-lg font-semibold rounded-md flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all duration-300 ease-in-out"
            >
              {isLoading ? <SupplementLoader /> : "SUBMIT"}
            </button>
          </div>
        </div>
      )}

      {/* Display the loader when the last set is completed */}
      {currentSet === null && (
        <div
          className="w-[100%] h-[100vh] flex flex-col justify-center items-center opacity-0 transition-opacity duration-500 ease-in-out"
          style={{ opacity: isLoading ? 1 : 0 }}
        >
          <p className="text-white text-[24px] mb-5">
            Finding the best supplements for you. This might take up to 10
            seconds.
          </p>
          <SupplementLoader />
        </div>
      )}
    </form>
  );
}

export default QuestioneerPage;
