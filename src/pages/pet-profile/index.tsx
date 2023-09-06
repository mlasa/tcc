import { Col, Container, Form, Modal, Row } from "react-bootstrap";
import { BodyStyled, HeaderStyled, ChangePetStyledButton, DrawerStyled } from "./styles";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link, useParams } from "react-router-dom";
import { Section } from "../../components/layout/components/styles/sections";
import { LinkOutlined, Pets } from "@material-ui/icons";
import { ERoutes } from "../../core/enums/routes";
import { WifiProtectedSetup } from "@mui/icons-material";
import useWindowDimensions from "../../core/hooks/useWindowDimensions";
import { Typography } from "@mui/material";
import Loading from "../../components/layout/components/loading";
import { selectUser } from "../../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/layout/components/button/button";
import { show } from "../../redux/toastSlice";

type QueryParamsT = {
    petId: string;
};

type PetT = {
    size: string;
    gender: string;
    age: string;
    id: number;
    breed: string;
    specie: string;
    name: string;
    description: string;
    weight: number;
    castrated: boolean;
}

/*
    TODO
    - Seção "oque vamos fazer hoje?"
*/


function ProfilePetPage() {
    const currentUrl = window.location.host;
    const params = useParams<QueryParamsT>();
    const [pets, setPets] = useState<Array<PetT>>([]);
    const [pet, setPet] = useState<PetT>({} as PetT);
    const [url, setUrl] = useState(currentUrl === "localhost:5173" ? "http://localhost:5173/historico" : "https://frontzinho.vercel.app/historico");
    const { width } = useWindowDimensions();
    const [isLoading, setIsLoading] = useState(true);
    const user = useSelector(selectUser);
    const [anchor, setAnchor] = useState(false);
    const [isOpenModalConnect, setIsOpenModalConnect] = useState(false);
    const [availableClinics, setAvailableClinics] = useState<Array<any>>([]);
    const [clinicSelected, setClinicSelected] = useState(0);
    const dispatch = useDispatch();

    async function getPetById(id: number) {
        const { data } = await api.get(`pets/${id}`);
        setPet(data);
    }

    useEffect(() => {
        params.petId && getPetById(Number(params.petId));
    }, []);

    function handleDrawer() {
        setAnchor(true);
    }

    function handleChange(e: React.MouseEvent<HTMLLIElement, MouseEvent>, pet: any) {
        e.preventDefault();
        setAnchor(false);

        setIsLoading(true);
        setPet(pet);
        setIsLoading(false);
    }

    async function getUserPets(userId: number) {
        const { data } = await api.get(`/users/${userId}/pets`);

        setPets(data);
    }

    async function getAllClinics() {
        const response = await api.get("/clinicas")
        setAvailableClinics(response.data);
    }

    async function connectPet() {
        try {
            api.post("/pets/connect", {
                clinica: clinicSelected,
                pet: pet.id
            });

            setClinicSelected(0);
            setIsOpenModalConnect(false);

            dispatch(
                show({ message: "Conectado!", type: "success" })
            );
        }
        catch (error) {
            console.log("Erro ao tentar conectar pet à clínica");
            dispatch(
                show({ message: "Não foi possível conectar-se à clínica no momento", delay: 4000, type: "error" })
            );
        }
    }

    useEffect(() => {
        setTimeout(() => { setIsLoading(false) }, 1000);
        getUserPets(user.id);
        getAllClinics();
    }, [])

    return (
        <>
            {
                !isLoading ?
                    <>
                        <Modal show={isOpenModalConnect} onHide={() => setIsOpenModalConnect(false)}>
                            <Modal.Header>Conectar {pet.name} à uma clínica</Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Row>
                                        <Col>
                                            <Form.Select aria-label="Selecione a clínica para conectar seu pet aqui"
                                                value={clinicSelected}
                                                onChange={(e) => setClinicSelected(Number(e.target.value))}
                                            >
                                                <option value={0}>Quer conectar seu pet com qual clínica?</option>
                                                {availableClinics.map(clinic => <option value={clinic.id}>{clinic.name}</option>)}
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                    <Button className="mt-3" color="#FF41AD" outlined="none" type="button" onClick={() => connectPet()}>
                                        Conectar
                                    </Button>
                                </Form>
                            </Modal.Body>
                        </Modal>
                        <HeaderStyled>
                            <Section>
                                <Container className="d-flex flex-column flex-md-row align-items-center justify-content-md-between justify-content-center">

                                    <div className="d-flex flex-column">
                                        <ChangePetStyledButton variant="body2" className="mb-4 d-flex align-items-center" onClick={handleDrawer}>
                                            <WifiProtectedSetup />
                                            {width > 1000 && <strong className="ms-1">Trocar</strong>}
                                        </ChangePetStyledButton>
                                        <div className="d-flex flex-md-row flex-column justify-content-center align-items-center justify-content-md-start">
                                            <img src={`/images/${pet.specie == "cachorro" ? "dog" : pet.specie == "gato" ? "cat" : "another_animals"}.svg`} />
                                            <div className="d-flex flex-column ms-0 ms-md-4 my-4 my-md-0 align-items-center align-items-md-start">
                                                <ChangePetStyledButton variant="body2" className="mb-4 d-flex align-items-center" onClick={() => setIsOpenModalConnect(true)}>
                                                    <LinkOutlined />
                                                    {width > 1000 && <strong className="ms-1">Conectar à clínica</strong>}
                                                </ChangePetStyledButton>
                                                <strong>{pet.name}</strong>
                                                <div className="wrapper-text">
                                                    <p>{pet.description ? pet.description : "Sem descrição"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="d-flex flex-column justify-content-center align-items-center"
                                        style={{ flex: 1 }}
                                    >
                                        <ul>
                                            <p className="d-flex align-items-center"><Pets className="me-2" fontSize="small" /><strong className="me-1">Idade:</strong>{pet.age}</p>
                                            <p className="d-flex align-items-center"><Pets className="me-2" fontSize="small" /><strong className="me-1">Raça:</strong>{pet.breed}</p>
                                            <p className="d-flex align-items-center"><Pets className="me-2" fontSize="small" /><strong className="me-1">Gênero:</strong>{pet.gender}</p>
                                            <p className="d-flex align-items-center"><Pets className="me-2" fontSize="small" /><strong className="me-1">Peso:</strong>{pet.weight}</p>
                                            <p className="d-flex align-items-center"><Pets className="me-2" fontSize="small" /><strong className="me-1">Castração:</strong>{pet.castrated ? "Sim" : "Não"}</p>
                                        </ul>
                                    </div>
                                </Container>
                            </Section>
                        </HeaderStyled>
                        <BodyStyled>
                            <Section>
                                <h3 className="mb-4">O que vamos fazer hoje? <span>Em breve</span></h3>
                            </Section>
                            <Section>
                                <div className="d-flex align-items-center mb-4">
                                    <h3>Linha do tempo</h3>
                                    <Link className="ms-3 ver-mais" to={ERoutes.HISTORY}>Ver mais</Link>
                                </div>
                                {/*@ts-ignore*/}
                                <div>
                                    <iframe
                                        id="myIframe"
                                        src={`${url}?origin=${"iframe"}`}
                                        width="100%"
                                        height="220px"
                                        title="Timeline"
                                    />
                                </div>
                            </Section>
                        </BodyStyled>
                        <DrawerStyled
                            anchor={"right"}
                            open={anchor}
                            onClose={() => setAnchor(false)}
                        >
                            <ul>
                                {pets.map(pet =>
                                    <li
                                        key={pet.id}
                                        onClick={(e) => handleChange(e, pet)}
                                    >
                                        <strong>{pet.name}</strong>
                                    </li>
                                )}
                            </ul>
                        </DrawerStyled>
                    </>
                    :
                    <>
                        <Loading />
                    </>
            }
        </>
    );
}
export default ProfilePetPage;