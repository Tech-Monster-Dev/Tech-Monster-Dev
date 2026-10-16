import React from "react";
import SomethingWentWrong from "../../legacy-pages/status/SomethingWentWrong";

class ErrorBoundary extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError() {
        return {
            hasError: true,
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error("React Error:", error);
        console.error("React Error Info:", errorInfo);
    }

    render() {

        if (this.state.hasError) {
            return <SomethingWentWrong />;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;