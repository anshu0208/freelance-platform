const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8">

      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Prev
      </button>

      {[...Array(pages).keys()].map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p + 1)}
          className={`px-3 py-1 rounded ${
            page === p + 1
              ? "bg-green-500 text-white"
              : "bg-gray-200"
          }`}
        >
          {p + 1}
        </button>
      ))}

      <button
        disabled={page === pages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>

    </div>
  );
};

export default Pagination;