export const fadeUp = {
    hidden: {
        opacity: 0,
        y: 60,
    },

    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};


export const fadeLeft = {
    hidden: {
        opacity: 0,
        x: -80,
    },

    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};


export const fadeRight = {
    hidden: {
        opacity: 0,
        x: 80,
    },

    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};


export const staggerContainer = {
    hidden: {},

    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};


export const cardAnimation = {
    hidden: {
        opacity: 0,
        y: 50,
        scale: 0.95,
    },

    visible: {
        opacity: 1,
        y: 0,
        scale: 1,

        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};


export const viewport = {
    once: true,
    amount: 0.15,
};