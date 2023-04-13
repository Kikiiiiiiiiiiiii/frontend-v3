import React, { useState, useEffect } from "react";
import { Modal, Form, Input, message, Button, Space, Image } from "antd";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import styles from "./index.module.scss";
import { login, user, system } from "../../../../api/index";
import { logoutAction } from "../../../../store/user/loginUserSlice";

interface PropInterface {
  open: boolean;
  active: boolean;
  scene: string;
  onCancel: () => void;
  success: () => void;
}

var interval: any = null;

export const BindNewMobileDialog: React.FC<PropInterface> = ({
  open,
  active,
  scene,
  onCancel,
  success,
}) => {
  const params = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const pathname = useLocation().pathname;
  const [loading, setLoading] = useState<boolean>(false);
  const [captcha, setCaptcha] = useState<any>({ key: null, img: null });
  const [current, setCurrent] = useState<number>(0);
  const [smsLoading, setSmsLoading] = useState<boolean>(false);

  useEffect(() => {
    form.setFieldsValue({
      mobile: "",
      captcha: "",
      sms: "",
    });
    setSmsLoading(false);
    setCurrent(120);
    if (open) {
      getCaptcha();
    }

    return () => {
      interval && clearInterval(interval);
    };
  }, [form, open]);

  const getCaptcha = () => {
    system.imageCaptcha().then((res: any) => {
      setCaptcha(res.data);
    });
  };

  const sendSms = () => {
    if (smsLoading) {
      return;
    }
    system
      .sendSms({
        mobile: form.getFieldValue("mobile"),
        image_key: captcha.key,
        image_captcha: form.getFieldValue("captcha"),
        scene: scene,
      })
      .then((res: any) => {
        setSmsLoading(!smsLoading);
        let time = 120;
        interval = setInterval(() => {
          time--;
          setCurrent(time);
          if (time === 0) {
            interval && clearInterval(interval);
            setCurrent(0);
            setSmsLoading(false);
          }
        }, 1000);
      })
      .catch((e: any) => {
        getCaptcha();
        message.error(e.message);
      });
  };

  const onFinish = (values: any) => {
    if (loading) {
      return;
    }
    setLoading(true);
    user
      .newMobile({
        mobile: values.mobile,
        mobile_code: values.sms,
      })
      .then((res: any) => {
        setLoading(false);
        message.success("绑定成功");
        if (active) {
          redirectHandler();
        } else {
          success();
        }
      })
      .catch((e: any) => {
        setLoading(false);
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const redirectHandler = () => {
    interval && clearInterval(interval);
    onCancel();
    if (pathname === "/login") {
      if (params.redirect) {
        navigate(params.redirect);
      } else {
        navigate("/");
      }
    } else {
      location.reload();
    }
  };

  const goLogout = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    login
      .logout()
      .then((res) => {
        setLoading(false);
        interval && clearInterval(interval);
        dispatch(logoutAction());
        onCancel();
        location.reload();
      })
      .catch((e) => {
        setLoading(false);
        message.error("网络错误");
      });
  };

  return (
    <>
      <Modal
        title=""
        centered
        forceRender
        open={open}
        width={500}
        footer={null}
        onCancel={() => {
          interval && clearInterval(interval);
          onCancel();
        }}
        maskClosable={false}
        closable={!active}
      >
        <div className={styles["tabs"]}>
          <div className={styles["tab-active-item"]}>绑定新手机号</div>
          {active && (
            <a
              className={styles["linkTab"]}
              onClick={() => {
                goLogout();
              }}
            >
              退出登录&gt;&gt;
            </a>
          )}
        </div>
        <Form
          form={form}
          name="bind-new-mobile-dialog"
          labelCol={{ span: 0 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          style={{ marginTop: 30 }}
        >
          <Form.Item
            name="mobile"
            rules={[{ required: true, message: "请输入新手机号码!" }]}
          >
            <Input
              style={{ width: 440, height: 54 }}
              autoComplete="off"
              placeholder="请输入新手机号码"
            />
          </Form.Item>
          <Form.Item>
            <Space align="baseline" style={{ height: 54 }}>
              <Form.Item
                name="captcha"
                rules={[{ required: true, message: "请输入图形验证码!" }]}
              >
                <Input
                  style={{ width: 310, height: 54, marginRight: 10 }}
                  autoComplete="off"
                  placeholder="请输入图形验证码"
                />
              </Form.Item>
              <Image
                onClick={() => getCaptcha()}
                src={captcha.img}
                width={110}
                height={39}
                preview={false}
                style={{ cursor: "pointer" }}
              />
            </Space>
          </Form.Item>

          <Form.Item>
            <Space align="baseline" style={{ height: 54 }}>
              <Form.Item
                name="sms"
                rules={[{ required: true, message: "请输入手机验证码!" }]}
              >
                <Input
                  style={{ width: 310, height: 54, marginRight: 30 }}
                  autoComplete="off"
                  placeholder="请输入手机验证码"
                />
              </Form.Item>
              <div className={styles["buttons"]}>
                {smsLoading && (
                  <div className={styles["send-sms-button"]}>{current}s</div>
                )}
                {!smsLoading && (
                  <div
                    className={styles["send-sms-button"]}
                    onClick={() => sendSms()}
                  >
                    获取验证码
                  </div>
                )}
              </div>
            </Space>
          </Form.Item>
          <Form.Item>
            <Button
              style={{ width: 440, height: 54, outline: "none" }}
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
            >
              立即绑定
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
