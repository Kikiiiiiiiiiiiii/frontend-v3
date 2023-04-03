import React, { useState, useEffect } from "react";
import { Modal, Form, Input, message, Space, Image } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";
import { miaosha, system } from "../../api/index";

interface PropInterface {
  msData: any;
  open: boolean;
  onCancel: () => void;
}

export const MiaoshaDialog: React.FC<PropInterface> = ({
  msData,
  open,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [captcha, setCaptcha] = useState<any>({ key: null, img: null });

  useEffect(() => {
    form.setFieldsValue({
      captcha: "",
    });

    if (open) {
      getCaptcha();
    }
  }, [form, open, msData]);

  const getCaptcha = () => {
    system.imageCaptcha().then((res: any) => {
      setCaptcha(res.data);
    });
  };

  const goMsOrder = (id: number) => {
    onCancel();
    navigate(
      "/order?course_id=" +
        msData.data.goods_id +
        "&course_type=" +
        msData.data.goods_type +
        "&goods_type=ms&goods_charge=" +
        msData.data.charge +
        "&goods_label=秒杀&goods_name=" +
        msData.data.goods_title +
        "&goods_id=" +
        id +
        "&goods_thumb=" +
        msData.data.goods_thumb
    );
  };

  const onFinish = (values: any) => {
    if (loading) {
      return;
    }
    setLoading(true);
    miaosha
      .join(msData.data.id, {
        captcha: values.captcha,
        captcha_key: captcha.key,
      })
      .then((res: any) => {
        message.success("抢购成功，请尽快支付");
        let orderId = res.data.id;
        setLoading(false);
        setTimeout(() => {
          goMsOrder(orderId);
        }, 600);
      })
      .catch((e: any) => {
        setLoading(false);
        form.setFieldsValue({
          captcha: "",
        });
        getCaptcha();
        message.error(e.message);
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <Modal
        title=""
        centered
        forceRender
        open={open}
        width={500}
        onCancel={() => {
          onCancel();
        }}
        okText="立即秒杀"
        maskClosable={false}
      >
        <div className={styles["tabs"]}>
          <div className={styles["tab-active-item"]}>秒杀活动</div>
        </div>
        <Form
          form={form}
          name="register-dialog"
          labelCol={{ span: 0 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          style={{ marginTop: 30 }}
        >
          <Form.Item>
            <Space align="baseline">
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
        </Form>
      </Modal>
    </>
  );
};
