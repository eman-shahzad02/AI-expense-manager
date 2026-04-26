import React, { useState, useEffect } from "react";
import { object, string, number, date } from "yup";
import { toast } from "react-toastify";
import moment from "moment";
import { parseDate } from "@internationalized/date";
import { NumericFormat } from "react-number-format";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { useDispatch, useSelector } from "react-redux";
import {
  useGetExpenseQuery,
  useAddExpenseMutation,
} from "../../features/api/apiSlices/expenseApiSlice";
import { updateLoader } from "../../features/loader/loaderSlice";

import { TransactionForm } from "../../components/Forms";
import validateForm from "../../utils/validateForm";
import TransactionTable from "../../components/Tables/TransactionTable";
import ExpenseBarChart from "../../components/ExpenseBarChart";

const Expenses = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: parseDate(moment().format("YYYY-MM-DD")),
  });

  const [errors, setErrors] = useState({});
  const [totalExpense, setTotalExpense] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isRefetchDeleteModal = useSelector(
    (state) => state.deleteTransactionModal.refetch
  );
  const isRefetchViewAndUpdateModal = useSelector(
    (state) => state.transactionViewAndUpdateModal.refetch
  );

  const expenseCategories = [
    { label: "Groceries", value: "groceries" },
    { label: "Utilities", value: "utilities" },
    { label: "Transportation", value: "transportation" },
    { label: "Healthcare", value: "healthcare" },
    { label: "Entertainment", value: "entertainment" },
    { label: "Clothing", value: "clothing" },
    { label: "Other", value: "other" },
  ];

  const validationSchema = object({
    title: string().required().min(5).max(15),
    amount: number().required().positive(),
    description: string().required().min(5).max(80),
    date: date().required(),
    category: string().required(),
  });

  const chipColorMap = {
    groceries: "success",
    utilities: "default",
    transportation: "success",
    healthcare: "warning",
    entertainment: "danger",
    clothing: "warning",
    other: "default",
  };

  const handleOnChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    validateForm(e.target.name, e.target.value, validationSchema, setErrors);
  };

  const handleDateChange = (date) =>
    setFormData((prev) => ({ ...prev, date }));

  const [addExpense, { isLoading: addExpenseLoading }] =
    useAddExpenseMutation();

  // Paginated (table)
  const {
    data,
    isLoading: getExpenseLoading,
    refetch,
  } = useGetExpenseQuery({
    page: currentPage,
    pageSize: 10,
  });

  // ALL expenses (excel)
  const {
    data: allExpenseData,
    isFetching: isDownloading,
  } = useGetExpenseQuery({
    page: 1,
    pageSize: 1000000,
  });

  const fetchData = async () => {
    await refetch();
    if (data?.expenses) {
      setTotalExpense(data.totalExpense || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    }
  };

  useEffect(() => {
    fetchData();
    if (isRefetchDeleteModal || isRefetchViewAndUpdateModal) {
      fetchData();
    }
  }, [data, isRefetchDeleteModal, isRefetchViewAndUpdateModal]);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      dispatch(updateLoader(40));

      const formattedDate = moment({
        year: formData.date.year,
        month: formData.date.month - 1,
        day: formData.date.day,
      }).format("YYYY-MM-DD");

      await addExpense({ ...formData, date: formattedDate }).unwrap();
      toast.success("Expense added successfully!");
    } catch (err) {
      toast.error(err?.data?.error || "Something went wrong");
    } finally {
      await refetch();
      dispatch(updateLoader(100));
    }
  };

  const handleDownloadExcel = () => {
    if (!allExpenseData?.expenses?.length) {
      toast.warn("No expense data to download");
      return;
    }

    let total = 0;

    const rows = allExpenseData.expenses.map((item, index) => {
      total += Number(item.amount);
      return {
        "#": index + 1,
        Title: item.title,
        Amount: item.amount,
        Category: item.category,
        Description: item.description,
        Date: moment(item.date).format("YYYY-MM-DD"),
      };
    });

    // TOTAL row
    rows.push({
      "#": "",
      Title: "TOTAL",
      Amount: total,
      Category: "",
      Description: "",
      Date: "",
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto column width
    worksheet["!cols"] = Object.keys(rows[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...rows.map((r) => String(r[key] || "").length)
      ),
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `expenses_${moment().format("YYYY_MM_DD")}.xlsx`
    );
  };

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <>
      <div className="flex flex-col items-center gap-4 mt-4">
        <h3 className="text-3xl lg:text-5xl text-center">
          Total Expense -{" "}
          <span className="text-red-400">
            $
            <NumericFormat
              className="ml-1"
              value={totalExpense}
              displayType="text"
              thousandSeparator
            />
          </span>
        </h3>

        <button
          onClick={handleDownloadExcel}
          disabled={isDownloading}
          className="px-4 py-2 mb-3 bg-red-500 text-white rounded-lg
                     hover:bg-red-600 disabled:opacity-50"
        >
          {isDownloading ? "Preparing..." : "Download Excel"}
        </button>
      </div>

      <ExpenseBarChart data={data?.expenses} />

      <section className="flex flex-col lg:flex-row px-6 pt-6 gap-8">
        <TransactionForm
          button="Add Expense"
          categories={expenseCategories}
          btnColor="danger"
          formData={formData}
          errors={errors}
          hasErrors={hasErrors}
          isLoading={addExpenseLoading}
          handleOnChange={handleOnChange}
          handleDateChange={handleDateChange}
          handleSubmit={handleSubmit}
        />

        <TransactionTable
          data={data?.expenses}
          name="expense"
          rowsPerPage={10}
          chipColorMap={chipColorMap}
          isLoading={getExpenseLoading}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </section>
    </>
  );
};

export default Expenses;
