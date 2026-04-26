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
  useGetIncomeQuery,
  useAddIncomeMutation,
} from "../../features/api/apiSlices/incomeApiSlice";
import { updateLoader } from "../../features/loader/loaderSlice";

import { TransactionForm } from "../../components/Forms";
import validateForm from "../../utils/validateForm";
import TransactionTable from "../../components/Tables/TransactionTable";
import IncomeBarChart from "../../components/IncomeBarChart";

const Incomes = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: parseDate(moment().format("YYYY-MM-DD")),
  });

  const [errors, setErrors] = useState({});
  const [totalIncome, setTotalIncome] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isRefetchDeleteModal = useSelector(
    (state) => state.deleteTransactionModal.refetch
  );
  const isRefetchViewAndUpdateModal = useSelector(
    (state) => state.transactionViewAndUpdateModal.refetch
  );

  const incomeCategories = [
    { label: "Salary", value: "salary" },
    { label: "Freelance", value: "freelance" },
    { label: "Investments", value: "investments" },
    { label: "Rent", value: "rent" },
    { label: "Youtube", value: "youtube" },
    { label: "Bitcoin", value: "bitcoin" },
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
    salary: "success",
    freelance: "default",
    investments: "success",
    rent: "warning",
    youtube: "danger",
    bitcoin: "warning",
    other: "default",
  };

  const handleOnChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    validateForm(e.target.name, e.target.value, validationSchema, setErrors);
  };

  const handleDateChange = (date) =>
    setFormData((prev) => ({ ...prev, date }));

  const [addIncome, { isLoading: addIncomeLoading }] =
    useAddIncomeMutation();

  // Paginated data (table)
  const {
    data,
    isLoading: getIncomeLoading,
    refetch,
  } = useGetIncomeQuery({
    page: currentPage,
    pageSize: 10,
  });

  // ALL data (excel)
  const {
    data: allIncomeData,
    isFetching: isDownloading,
  } = useGetIncomeQuery({
    page: 1,
    pageSize: 1000000,
  });

  const fetchData = async () => {
    await refetch();
    if (data?.incomes) {
      setTotalIncome(data.totalIncome || 0);
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

      await addIncome({ ...formData, date: formattedDate }).unwrap();
      toast.success("Income added successfully");
    } catch (err) {
      toast.error(err?.data?.error || "Something went wrong");
    } finally {
      await refetch();
      dispatch(updateLoader(100));
    }
  };

  const handleDownloadExcel = () => {
    if (!allIncomeData?.incomes?.length) {
      toast.warn("No data to download");
      return;
    }

    let total = 0;

    const rows = allIncomeData.incomes.map((item, index) => {
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

    rows.push({
      "#": "",
      Title: "TOTAL",
      Amount: total,
      Category: "",
      Description: "",
      Date: "",
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet["!cols"] = Object.keys(rows[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...rows.map((r) => String(r[key] || "").length)
      ),
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Incomes");

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `incomes_${moment().format("YYYY_MM_DD")}.xlsx`
    );
  };

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <>
      <div className="flex flex-col items-center gap-4 mt-4">
        <h3 className="text-3xl lg:text-5xl text-center">
          Total Income -{" "}
          <span className="text-emerald-400">
            $
            <NumericFormat
              className="ml-1"
              value={totalIncome}
              displayType="text"
              thousandSeparator
            />
          </span>
        </h3>

        <button
          onClick={handleDownloadExcel}
          disabled={isDownloading}
          className="px-4 py-2 mb-3 bg-emerald-500 text-white rounded-lg
                     hover:bg-emerald-600 disabled:opacity-50"
        >
          {isDownloading ? "Preparing..." : "Download Excel"}
        </button>
      </div>

      <IncomeBarChart data={data?.incomes} />

      <section className="flex flex-col lg:flex-row px-6 pt-6 gap-8">
        <TransactionForm
          button="Add Income"
          categories={incomeCategories}
          btnColor="success"
          formData={formData}
          errors={errors}
          hasErrors={hasErrors}
          isLoading={addIncomeLoading}
          handleOnChange={handleOnChange}
          handleDateChange={handleDateChange}
          handleSubmit={handleSubmit}
        />

        <TransactionTable
          data={data?.incomes}
          name="income"
          chipColorMap={chipColorMap}
          rowsPerPage={10}
          isLoading={getIncomeLoading}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </section>
    </>
  );
};

export default Incomes;
