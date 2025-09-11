package com.event.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@DiscriminatorValue("ADMIN")
@PrimaryKeyJoinColumn(name = "user_id")
@Table(name = "admin")

public class Admin extends User {

}
