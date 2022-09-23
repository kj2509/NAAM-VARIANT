import style from "./LoginWrapper.module.css";

const LoginWrapper = (props) => {
    return (
        <div className={style.page}>
            <div className={style.container}>
                <div className={style.leftContainer}>
                    <p className={style.introText}>Explore your student's emotion <br /> with&nbsp;
                    <span className={style.brandText}>NA'AM</span>
                    </p>
                </div>
                <div className={style.rightContainer}>
                    {props.children}
                </div>
            </div>
        </div>
    );
}

export default LoginWrapper