import { Col, Container, Form, Row } from "react-bootstrap";
import HeaderPage from "../../components/layout/components/headerPage/headerPage";
import { MouseEventHandler, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { show } from "../../redux/toastSlice";
import api from "../../services/api";
import { EHttpResponse } from "../../core/enums/http-responses";
import Button from "../../components/layout/components/button/button";
import { useParams } from "react-router-dom";
import { Section } from "../../components/layout/components/styles/sections";

type TimelinePointT = {
    title: string;
    type: string;
    description: string;
    vet: string;
    clinic: string;
};

type QueryParamsT = {
    petId: string;
    petName: string;
};

function CreateNewTimelinePoint() {
    const [timelinePoint, setTimelinePoint] = useState({} as TimelinePointT);
    const [validated, setValidated] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const params = useParams<QueryParamsT>();

    async function send() {
        try {
            const { data } = await api.post(`/pets/${params.petId}/timeline`, timelinePoint);
            dispatch(show({ message: `Novo registro na linha do tempo!`, type: "success" }));
            setLoading(false);

        } catch (error: any) {
            setLoading(false);
            if (error.response.status && typeof error.response.status === 'number') {
                const status = error.response.status;
                const errorMessage = EHttpResponse[status as keyof typeof EHttpResponse];
                dispatch(show({ message: errorMessage, type: "danger", delay: 4000 }));
            } else {
                dispatch(show({ message: "Não foi possível adicionar ponto", type: "danger", delay: 4000 }));
            }
        }
    }

    const handleSubmit: MouseEventHandler<HTMLFormElement> = async (event) => {
        setLoading(true);
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        else {
            setValidated(true);
            send();
        }
    }

    /*useEffect(() => {
        api.get(`/pets/${params.petId}/timeline`)
            .then(response => {
                console.log(response);
            })
    }, [params.petId])*/


    return (
        <Section>
            <Container>
                <HeaderPage
                    textToStyle={`${params.petName}`}
                    style={{ color: "#FF41AD" }}
                    title="Linha do tempo"
                    text={`Novo registro para ${params.petName}`}
                />

                <Form
                    className="d-flex flex-column align-items-end mt-4"
                    validated={validated}
                    onSubmit={handleSubmit}
                >
                    <div style={{ width: "100%" }}>
                        <Row>
                            <Col xs={12} md={3}>
                                <Form.Group className="mb-3" controlId="titulo">
                                    <Form.Control value={timelinePoint.title} required type="text" placeholder="Título" onChange={e => setTimelinePoint(prev => ({ ...prev, title: e.target.value }))} />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={3}>
                                <Form.Group className="mb-3" controlId="vet">
                                    <Form.Control value={timelinePoint.vet} required type="text" placeholder="Veterinário" onChange={e => setTimelinePoint(prev => ({ ...prev, vet: e.target.value }))} />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={3}>
                                <Form.Group className="mb-3" controlId="clinic">
                                    <Form.Control value={timelinePoint.clinic} required type="text" placeholder="Clínica" onChange={e => setTimelinePoint(prev => ({ ...prev, clinic: e.target.value }))} />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={3}>
                                <Form.Select aria-label="Tipo do registro"
                                    value={timelinePoint.type}
                                    onChange={(e) => setTimelinePoint(prev => ({ ...prev, type: e.target.value }))}
                                >
                                    <option value={""}>Selecione</option>
                                    <option value={"CONSULTA"}>Consulta</option>
                                    <option value={"MEDICAMENTO"}>Medicamento</option>
                                    <option value={"PROCEDIMENTO"}>Procedimento</option>
                                    <option value={"OUTRO"}>Outro</option>
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row className="mt-3 mt-lg-0">
                            <Col xs={12}>
                                <Form.Group className="mb-3" controlId="description">
                                    <Form.Control as="textarea" value={timelinePoint.description} required type="text" placeholder="Description" onChange={e => setTimelinePoint(prev => ({ ...prev, description: e.target.value }))} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div >

                    <Button
                        color="#FF41AD"
                        outlined="none"
                        type="submit"
                        onClick={!isLoading ? () => { } : undefined}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Carregando…' : 'Criar'}
                    </Button>
                </Form >
            </Container >
        </Section >
    )
}
export default CreateNewTimelinePoint;