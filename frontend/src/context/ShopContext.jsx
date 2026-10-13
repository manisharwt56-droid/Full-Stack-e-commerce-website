import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = "$";
    const delivery_fee = 10;

    // Backend URL ke end se extra slash remove hoga
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");

    const [search, setSearch] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState(
        localStorage.getItem("token") || ""
    );

    const navigate = useNavigate();

    const addToCart = async (itemId, size) => {
        if (!size) {
            toast.error("Select Product Size");
            return;
        }

        const cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
        } else {
            cartData[itemId] = { [size]: 1 };
        }

        setCartItems(cartData);

        if (token) {
            try {
                const response = await axios.post(
                    `${backendUrl}/api/cart/add`,
                    { itemId, size },
                    { headers: { token } }
                );

                if (!response.data.success) {
                    toast.error(response.data.message || "Unable to add to cart");
                }
            } catch (error) {
                console.error("Add to cart error:", error);
                toast.error(error.response?.data?.message || error.message);
            }
        }
    };

    const getCartCount = () => {
        let totalCount = 0;

        for (const itemId in cartItems) {
            for (const size in cartItems[itemId]) {
                if (cartItems[itemId][size] > 0) {
                    totalCount += cartItems[itemId][size];
                }
            }
        }

        return totalCount;
    };

    const updateQuantity = async (itemId, size, quantity) => {
        const cartData = structuredClone(cartItems);

        if (!cartData[itemId]) return;

        cartData[itemId][size] = quantity;
        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(
                    `${backendUrl}/api/cart/update`,
                    { itemId, size, quantity },
                    { headers: { token } }
                );
            } catch (error) {
                console.error("Update quantity error:", error);
                toast.error(error.response?.data?.message || error.message);
            }
        }
    };

    const getCartAmount = () => {
        let totalAmount = 0;

        for (const itemId in cartItems) {
            const itemInfo = products.find(
                (product) => product._id === itemId
            );

            if (!itemInfo) continue;

            for (const size in cartItems[itemId]) {
                const quantity = cartItems[itemId][size];

                if (quantity > 0) {
                    totalAmount += itemInfo.price * quantity;
                }
            }
        }

        return totalAmount;
    };

    const getProductsData = async () => {
        if (!backendUrl) {
            console.error("VITE_BACKEND_URL is missing");
            toast.error("Backend URL is not configured");
            return;
        }

        try {
            console.log("Backend URL:", backendUrl);

            const response = await axios.get(
                `${backendUrl}/api/product/list`
            );

            if (response.data.success) {
                setProducts(response.data.products);
            } else {
                toast.error(response.data.message || "Unable to load products");
            }
        } catch (error) {
            console.error("Get products error:", error);
            toast.error(
                error.response?.data?.message || error.message
            );
        }
    };

    const getUseCart = async (currentToken) => {
        try {
            const response = await axios.post(
                `${backendUrl}/api/cart/get`,
                {},
                { headers: { token: currentToken } }
            );

            if (response.data.success) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            console.error("Get cart error:", error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    useEffect(() => {
        localStorage.setItem("token", token);
    }, [token]);

    useEffect(() => {
        getProductsData();
    }, []);

    useEffect(() => {
        if (token) {
            getUseCart(token);
        }
    }, [token]);

    const value = {
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        setCartItems,
        addToCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
        navigate,
        backendUrl,
        setToken,
        token
    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
