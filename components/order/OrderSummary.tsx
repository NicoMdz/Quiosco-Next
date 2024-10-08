"use client"
import { useStore } from "@/src/store";
import ProductDetails from "./ProductDetails";
import { useMemo } from "react";
import { formatCurrency } from "@/src/utils";
import { createOrder } from "@/actions/create-order-action";
import { OrderSchema } from "@/src/schema";
import { toast } from "react-toastify";

export default function OrderSummary() {
  const { order, clearOrder } = useStore();
  const total = useMemo(() => order.reduce((total, item) => total + (item.quantity * item.price), 0), [order])

  const handleCreateOrder = async (formData : FormData) => {
    const data = {
      name: formData.get("name"),
      total,
      order
    }

    // Validación del cliente
    const result = OrderSchema.safeParse(data)
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        toast.error(issue.message)
      })
      return
    }
    // Validación del servidor
    const response = await createOrder(data)
    if (response?.errors) {
      response.errors.forEach((issue) => {
        toast.error(issue.message)
      })
    }

    toast.success("Pedido Realizdo Correctamente")
    clearOrder()

  }
  return (
    <aside className=" lg:h-screen lg:overflow-y-scroll md:w-64 lg:w-96 p-5">
      <h1 className=" text-4xl text-center font-black">Mi pedido</h1>

      {order.length === 0 ? <p className="text-center my-10">La orden está vacía</p> : (
        <div className=" mt-5">
          {order.map(item => (
            <ProductDetails 
              key={item.id}
              item={item}
            />
          ))}

          <p className=" text-2xl mt-20 text-center">Total a pagar: {""}
            <span className="font-bold">{formatCurrency(total)}</span>
          </p>
          <form 
            className=" w-full mt-10 space-y-5"
            action={handleCreateOrder}
          >
            <input type="text" placeholder="Tu Nombre" className=" bg-white border border-gray-100 p-2 w-full" name="name"/>

            <input type="submit" className="py-2 font-bold rounded uppercase text-white bg-black w-full text-center cursor-pointer" value={"Confrimar Pedido"} />
          </form>
        </div>
      )}
    </aside>
  );
}
