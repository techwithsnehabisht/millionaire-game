import { useNavigate } from "react-router-dom";

function Home() {
  const categories = [
    {
      id: 9,
      name: "General Knowledge",
    },
    {
      id: 17,
      name: "Science",
    },
    {
      id: 21,
      name: "Sports",
    },
    {
      id: 23,
      name: "History",
    },
    {
      id: 11,
      name: "Movies",
    },
    {
      id: 18,
      name: "Computers",
    },
  ];

  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-10">Choose a Category</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              navigate("/game", {
                state: {
                  categoryId: item.id,
                  categoryName: item.name,
                },
              })
            }
            className="w-64 p-5 bg-white rounded-lg shadow-md hover:bg-blue-500 hover:text-white transition duration-300"
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;
