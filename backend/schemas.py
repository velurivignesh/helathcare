from pydantic import BaseModel


class PatientCreate(BaseModel):
    name: str
    age: int
    phone: str


class PatientResponse(BaseModel):
    id: int
    name: str
    age: int
    phone: str

    class Config:
        from_attributes = True