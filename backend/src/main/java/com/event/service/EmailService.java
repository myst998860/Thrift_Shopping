package com.event.service;

import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.event.model.Attendee;

import com.event.model.Donation;
import com.event.model.Program;
import com.event.model.Partner;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) {
        if (to == null || to.isBlank()) return; // skip if email is null
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
        System.out.println("✅ Email sent to " + to + " | Subject: " + subject);
    }

    // ---------------- SEND DONATION EMAILS ----------------
    public void sendDonationEmails(Donation donation) {
        Program program = donation.getProgram();

        // Send email to donor
        if (donation.getEmail() != null) {
            String donorSubject = "Thank You for Your Donation!";
            String donorBody = String.format("""
                    Dear %s,

                    Thank you for your generous donation to the program "%s".

                    Kind regards,
                    Event Management Team
                    """,
                    donation.getFullName(),
                    program != null ? program.getProgramTitle() : "our campaign"
            );
            sendEmail(donation.getEmail(), donorSubject, donorBody);
        }

        // Send email to program partner
        Partner partner = program.getPartner();
        System.out.println("Program ID: " + partner);

        String partnerEmail = partner.getEmail();
        if (partnerEmail != null && !partnerEmail.isBlank()) {
       
            String partnerSubject = "New Donation Received for Your Program";
            String partnerBody = String.format("""
                    Hello %s,

                    Your program "%s" has received a new donation.

                    Donor Details:
                    Name: %s
                    Email: %s
                    Condition: %s
                    Quantity: %s

                    Please log in to your dashboard to view details.

                    Regards,
                    Event Management Team
                    """,
                    partner.getFullname(),
                    program.getProgramTitle(),
                    donation.getFullName(),
                    donation.getEmail(),
                    donation.getOverallCondition(),
                    donation.getEstimatedQuantity()
            );
            sendEmail(partner.getEmail(), partnerSubject, partnerBody);
        }
    }
    
    
    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Your OTP Code");
        message.setText("Your OTP for signup is: " + otp + "\nIt will expire in 5 minutes.");
        message.setFrom("your_email@gmail.com"); // must match your spring.mail.username

        mailSender.send(message);
    }
    
}

//@Service
//public class EmailService {
//
//    @Autowired
//    private JavaMailSender mailSender;
//
//    @Async
//    public void sendDonationEmails(Donation donation) {
//        // ✅ Send email to donor
//        SimpleMailMessage donorMsg = new SimpleMailMessage();
//        donorMsg.setTo(donation.getEmail());
//        donorMsg.setSubject("Thank you for your donation!");
//        donorMsg.setText("Dear " + donation.getFullName() + ",\n\n" +
//                "Thank you for donating to our cause. Our partner NGO will contact you soon.\n\n" +
//                "Best regards,\nThriftGood Team");
//        mailSender.send(donorMsg);
//
//        // ✅ Send email to program creator if this donation is linked to a program
//        Program program = donation.getProgram();
//        if (program != null) {
//            Partner partner = program.getPartner();
//            if (partner != null && partner.getEmail() != null) {
//                SimpleMailMessage partnerMail = new SimpleMailMessage();
//                partnerMail.setTo(partner.getEmail()); // ✅ inherited from User
//                partnerMail.setSubject("New Donation Received");
//                partnerMail.setText(
//                    "Hello " + partner.getFullname() + ",\n\n" + // ✅ inherited from User
//                    "A donation has been made by " + donation.getFullName() +
//                    " (" + donation.getEmail() + ") for your program: " +
//                    program.getProgramTitle() + ".\n\nThank you!"
//                );
//                mailSender.send(partnerMail);
//            } else {
//                System.out.println("Partner or partner email is null!");
//            }
//}
//}
//}
